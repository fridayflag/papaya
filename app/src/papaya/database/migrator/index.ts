import z from "zod";

// ---------------------------------------------------------------------------
// Schema map types: one object keyed by resource kind, values are Zod schemas
// (each schema extends base shapes like urn, kind, @version).
// ---------------------------------------------------------------------------

export type Version = number;

/** Map of resource kind (e.g. "papaya:document:journal") to its Zod schema. */
export type VersionedSchemaMap = Record<string, z.ZodTypeAny>;

/** Versioned schema bundle: @version plus the schema map (contract for a migration version). */
export type VersionedSchema<V extends Version = Version> = {
  "@version": V;
  schema: VersionedSchemaMap;
};

/** Union of all record types inferred from a schema map (one type per resource kind). */
export type InferSchemaMapRecords<S extends VersionedSchemaMap> = {
  [K in keyof S]: z.infer<S[K]>;
}[keyof S];

/** Type-safe migration runner: (oldRecords: Array<Old>) => Array<New>. */
export type MigrationRunner<Old, New> = (oldRecords: Array<Old>) => Array<New>;

// ---------------------------------------------------------------------------
// Root migration: establishes the contract and typed runner pattern.
// Any new migration extends the last and defines (OldSchema) => (NewSchema).
// ---------------------------------------------------------------------------

/**
 * Root migration for a given schema version. Defines:
 * 1) The Zod schema contract for this version (schema map keyed by resource kind),
 * 2) Type safety for those schemas (Old/New inferred from the map),
 * 3) A runner (oldRecords: Array<OldSchema>) => Array<NewSchema>, typed via overload in subclasses.
 *
 * When the app schema changes, add a new migration class that extends the previous
 * migration (so "extends the last") and implements the runner from previous records
 * to the new schema.
 *
 * Base class uses unknown[] so subclasses can override with concrete (Prev -> Next) signatures.
 */
export abstract class RootMigration<SchemaMap extends VersionedSchemaMap> {
  /** Schema contract for this migration's output (resource kind -> Zod schema). */
  abstract readonly schema: SchemaMap;

  /** Version tag for this migration's output (e.g. 1, 2). */
  abstract readonly version: Version;

  /**
   * Typed runner: transforms old DB records to new schema.
   * In subclasses, override and narrow the signature to
   * (oldRecords: Array<InferSchemaMapRecords<PrevSchema>>) => Array<InferSchemaMapRecords<NextSchema>>.
   */
  getRunner(): (oldRecords: unknown[]) => unknown[] {
    return (oldRecords) => oldRecords;
  }

  /**
   * Run migration on a batch of records. Default implementation delegates to getRunner().
   */
  run(oldRecords: unknown[]): unknown[] {
    return this.getRunner()(oldRecords);
  }
}

// ---------------------------------------------------------------------------
// Concrete migration: extends the previous migration and defines Prev -> Next.
// ---------------------------------------------------------------------------

/**
 * A migration that transforms from PreviousSchemaMap to NextSchemaMap.
 * Extend this (or a previous migration class) and implement migrate() with the
 * typed signature (oldRecords: Array<InferSchemaMapRecords<Prev>>) => Array<InferSchemaMapRecords<Next>>.
 * getRunner() returns that transform as a function (typed as unknown[] for base compatibility).
 */
export abstract class Migration<
  PreviousSchemaMap extends VersionedSchemaMap,
  NextSchemaMap extends VersionedSchemaMap,
> extends RootMigration<NextSchemaMap> {
  /** Schema contract we're migrating from (same as "previous" migration's schema). */
  abstract readonly previousSchema: PreviousSchemaMap;

  /**
   * Type-safe runner: (oldRecords: Array<OldRecord>) => Array<NewRecord>.
   * Implement in subclasses; the types enforce the contract.
   */
  abstract migrate(
    oldRecords: Array<InferSchemaMapRecords<PreviousSchemaMap>>
  ): Array<InferSchemaMapRecords<NextSchemaMap>>;

  override getRunner(): (oldRecords: unknown[]) => unknown[] {
    return (oldRecords) =>
      this.migrate(oldRecords as Array<InferSchemaMapRecords<PreviousSchemaMap>>);
  }

  override run(oldRecords: unknown[]): unknown[] {
    return this.migrate(oldRecords as Array<InferSchemaMapRecords<PreviousSchemaMap>>);
  }

  /**
   * Returns the migration runner with full type safety:
   * (oldRecords: Array<InferSchemaMapRecords<PreviousSchemaMap>>) => Array<InferSchemaMapRecords<NextSchemaMap>>.
   */
  getTypedRunner(): MigrationRunner<
    InferSchemaMapRecords<PreviousSchemaMap>,
    InferSchemaMapRecords<NextSchemaMap>
  > {
    return (oldRecords) => this.migrate(oldRecords);
  }
}

// ---------------------------------------------------------------------------
// Example: root schema and two version migrations (V1 -> V2).
// ---------------------------------------------------------------------------

const UserSchemaV1 = z.object({
  urn: z.string(),
  kind: z.literal("papaya:user"),
  "@version": z.union([z.number(), z.string()]),
  name: z.string(),
});

const TodoSchemaV1 = z.object({
  urn: z.string(),
  kind: z.literal("papaya:todo"),
  "@version": z.union([z.number(), z.string()]),
  title: z.string(),
  completed: z.boolean(),
});

const rootSchemaMap = {
  "papaya:user": UserSchemaV1,
  "papaya:todo": TodoSchemaV1,
} as const satisfies VersionedSchemaMap;

type RootSchemaMap = typeof rootSchemaMap;

/** Root (identity) migration for version 1. */
export class RootMigrationV1 extends RootMigration<RootSchemaMap> {
  readonly schema = rootSchemaMap;
  readonly version = 1;
}

// V2: add email to user, add description to todo
const UserSchemaV2 = UserSchemaV1.extend({ email: z.string() });
const TodoSchemaV2 = TodoSchemaV1.extend({ description: z.string() });

const version2SchemaMap = {
  "papaya:user": UserSchemaV2,
  "papaya:todo": TodoSchemaV2,
} as const satisfies VersionedSchemaMap;

type Version2SchemaMap = typeof version2SchemaMap;

/** Migration from V1 to V2: add email on user, description on todo. */
export class Version2Migration extends Migration<RootSchemaMap, Version2SchemaMap> {
  readonly previousSchema = rootSchemaMap;
  readonly schema = version2SchemaMap;
  readonly version = 2;

  override migrate(
    oldRecords: Array<InferSchemaMapRecords<RootSchemaMap>>
  ): Array<InferSchemaMapRecords<Version2SchemaMap>> {
    return oldRecords.map((record) => {
      if (record.kind === "papaya:user") {
        return {
          ...record,
          email: (record as { email?: string }).email ?? "",
          "@version": 2,
        };
      }
      if (record.kind === "papaya:todo") {
        return {
          ...record,
          description: (record as { description?: string }).description ?? "",
          "@version": 2,
        };
      }
      return record as InferSchemaMapRecords<Version2SchemaMap>;
    }) as Array<InferSchemaMapRecords<Version2SchemaMap>>;
  }
}
