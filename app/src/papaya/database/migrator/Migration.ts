import z from "zod";

type Version = number;

type PapayaSchema = {
  '@version': Version;
  'schema': z.ZodSchema;
};

type VersionedPapayaSchema<V extends Version> = PapayaSchema & {
  '@version': V
};

class Migration<
  PreviousVersion extends Version,
  PreviousSchema extends VersionedPapayaSchema<PreviousVersion>,
  NextSchema extends PapayaSchema
> {
  constructor(previousVersion: PreviousVersion, previousSchema: PreviousSchema, nextSchema: NextSchema) {
    this.previousVersion = previousVersion;
    this.previousSchema = previousSchema;
    this.nextSchema = nextSchema;
  }

  private getMigrationName(): string {
    return `migration_${this.previousVersion}_to_${this.nextVersion}`;
  }


}