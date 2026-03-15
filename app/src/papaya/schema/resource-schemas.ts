
import {
  createResourceSchema
} from "@/schema/template-schemas";
import z from "zod";
import { CurrencyIso4217Schema, PictogramSchema, PriceConversionSchema } from "./etc-schemas";
import { JournalEntryRidSchema, JournalRidSchema, TransactionRidSchema } from "./namespace-schemas";
import {
  PersonSlugSchema
} from "./string-schemas";

/**
 * Journal schema
 */
export const JournalSchema = createResourceSchema("Journal", {
  /**
   * The name for the journal
   */
  name: z.string(),
  /**
   * Optional notes for the journal
   */
  notes: z.string(),
  /**
   * The last time the journal was opened
   */
  lastOpenedAt: z.iso.datetime().nullable(),
  /**
   * The currency used to express monetary values in the journal. Other currencies
   * can be used, but the journal maintains monetary values in a single currency.
   */
  currency: CurrencyIso4217Schema,
  /**
   * The date and time the journal was created
   */
  createdAt: z.iso.datetime(),
});


export const UserSettingsSchema = createResourceSchema("UserSettings", {
  journal: z.object({
    selection: z.enum(["ALWAYS_PROMPT", "DEFAULT_JOURNAL_ELSE_PROMPT", "LAST_OPENED"]).default("LAST_OPENED"),
    defaults: z.object({
      defaultJournalRid: JournalRidSchema.nullish(),
    }),
  }),
});

export const AppConfigSchema = createResourceSchema("AppConfig", {
  userSettings: UserSettingsSchema,
});

export const PersonSchema = createResourceSchema("Person", {
  slug: PersonSlugSchema,
  nickname: z.string(),
  icon: PictogramSchema.nullish(),
});

export const TaskSchema = createResourceSchema("Task", {
  memo: z.string(),
  completedAt: z.iso.date().nullable(),
});

export const TransactionSchema = createResourceSchema("Transaction", {
  parent: JournalEntryRidSchema.nullable(),
  memo: z.string(),
  amount: z.number(),
  convertedFrom: PriceConversionSchema.nullish(),
  date: z.iso.date().nullish(),
  time: z.iso.time().nullish(),
  sourceAccount: z.string().nullish(),
  destinationAccount: z.string().nullish(),
  topics: z.array(z.string()).nullish(),
});

export const JournalEntrySchema = createResourceSchema("JournalEntry", {
  journalRid: JournalRidSchema,
  transactions: z.record(TransactionRidSchema, TransactionSchema),
  memo: z.string().nullish(),
  date: z.iso.date().nullish(),
  time: z.iso.time().nullish(),
});

export type Journal = z.infer<typeof JournalSchema>;
export type UserSettings = z.infer<typeof UserSettingsSchema>;
export type PapayaAppConfig = z.infer<typeof AppConfigSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type JournalEntry = z.infer<typeof JournalEntrySchema>;
