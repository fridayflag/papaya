import { PapayaResourceNamespace } from "@/schema/namespace-schemas";
import {
  AppConfigSchema,
  JournalEntrySchema,
  JournalSchema,
  PersonSchema,
  TaskSchema,
  TransactionSchema,
  UserSettingsSchema,
} from "@/schema/resource-schemas";
import { ResourceSchema } from "@/schema/template-schemas";

export const ResourceSchemaRegistry = {
  AppConfig: AppConfigSchema,
  Journal: JournalSchema,
  JournalEntry: JournalEntrySchema,
  UserSettings: UserSettingsSchema,
  Person: PersonSchema,
  Task: TaskSchema,
  Transaction: TransactionSchema,
} as const satisfies {
  [N in PapayaResourceNamespace]: ResourceSchema<N>
};
