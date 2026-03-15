import z from "zod";

export const PapayaResourceNamespaceSchema = z.enum([
  "Journal",
  "JournalEntry",
  "UserSettings",
  "Person",
  "Task",
  "Transaction",
  "AppConfig",
] as const);

export const ridSchemaFromNamespace = <N extends PapayaResourceNamespace>(
  ns: N
) => {
  return z.templateLiteral([kindSchemaFromNamespace(ns), ":", z.uuid()]) as z.ZodTemplateLiteral<PapayaResourceRid<N>>;
};

export const kindSchemaFromNamespace = <N extends PapayaResourceNamespace>(ns: N) => {
  return z.literal(`papaya:${ns.toLowerCase()}`) as z.ZodLiteral<PapayaResourceKind<N>>;
};

const ResourceRidRegistry = Object.fromEntries(
  PapayaResourceNamespaceSchema.options.map((ns) => [
    `${ns}RidSchema`,
    ridSchemaFromNamespace(ns),
  ])
) as {
    [N in PapayaResourceNamespace as `${N}RidSchema`]:
    z.ZodTemplateLiteral<PapayaResourceRid<N>>;
  };

export const {
  JournalRidSchema,
  JournalEntryRidSchema,
  UserSettingsRidSchema,
  PersonRidSchema,
  TaskRidSchema,
  TransactionRidSchema,
  AppConfigRidSchema,
} = ResourceRidRegistry;

export const PapayaResourceRidSchema = z.union(Object.values(ResourceRidRegistry));

export type PapayaResourceNamespace = z.infer<typeof PapayaResourceNamespaceSchema>;
export type PapayaResourceKind<N extends PapayaResourceNamespace> = `papaya:${Lowercase<N>}`;
export type PapayaResourceRid<N extends PapayaResourceNamespace> = `${PapayaResourceKind<N>}:${string}`;

export type JournalRid = z.infer<typeof JournalRidSchema>;
export type JournalEntryRid = z.infer<typeof JournalEntryRidSchema>;
export type UserSettingsRid = z.infer<typeof UserSettingsRidSchema>;
export type PersonRid = z.infer<typeof PersonRidSchema>;
export type TaskRid = z.infer<typeof TaskRidSchema>;
export type TransactionRid = z.infer<typeof TransactionRidSchema>;
export type AppConfigRid = z.infer<typeof AppConfigRidSchema>;
