import { PapayaResourceNamespace } from "@/model/schema/namespace-schemas";
import {
  JournalEntrySchema,
  JournalSchema,
  PersonSchema,
  PreferencesSchema,
  TaskSchema,
  TransactionSchema,
} from "@/model/schema/resource-schemas";
import { ResourceSchema } from "@/model/schema/template-schemas";

export const ResourceSchemaRegistry = {
  Journal: JournalSchema,
  JournalEntry: JournalEntrySchema,
  Preferences: PreferencesSchema,
  Person: PersonSchema,
  Task: TaskSchema,
  Transaction: TransactionSchema,
} as const satisfies {
  [N in PapayaResourceNamespace]: ResourceSchema<N>
};
