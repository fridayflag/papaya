import { amountValidationPattern } from "@/constants/regex";
import z from "zod";
import { CurrencyIso4217Schema } from "../journal/money";
import { AccountSlugSchema, TopicSlugSchema } from "../journal/string";
import { EntryUrnSchema, JournalUrnSchema, SubEntryUrnSchema } from "../support/urn";

export const JournalFormBaseSchema = z.object({
  memo: z.string(),
  amount: z.string().regex(amountValidationPattern),
  date: z.iso.date(),
  topics: z.array(TopicSlugSchema),
  sourceAccount: AccountSlugSchema.nullable(),
  destinationAccount: AccountSlugSchema.nullable(),
});
export type JournalFormBase = z.infer<typeof JournalFormBaseSchema>;

const JournalFormEntrySchema = JournalFormBaseSchema.extend({
  urn: EntryUrnSchema.nullable(),
});

const JournalFormChildEntrySchema = JournalFormEntrySchema.extend({
  urn: SubEntryUrnSchema.nullable(),
});

export const JournalFormSchema = z.object({
  baseEntry: JournalFormEntrySchema,
  childEntries: z.array(JournalFormChildEntrySchema),
  context: z.object({
    journalId: JournalUrnSchema,
    currency: CurrencyIso4217Schema,
  }),
});

export type JournalForm = z.infer<typeof JournalFormSchema>;
