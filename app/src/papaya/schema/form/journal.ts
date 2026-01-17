import { amountValidationPattern } from "@/constants/regex";
import z from "zod";
import { AccountSlugSchema, TopicSlugSchema } from "../journal/string";
import { EntryUrnSchema } from "../support/urn";

export const JournalFormBaseSchema = z.object({
  urn: EntryUrnSchema,
  parent: EntryUrnSchema.nullable(),
  memo: z.string(),
  amount: z.string().regex(amountValidationPattern),
  date: z.iso.date(),
  topics: z.array(TopicSlugSchema),
  sourceAccount: AccountSlugSchema.nullable(),
  destinationAccount: AccountSlugSchema.nullable(),
});
export type JournalFormBase = z.infer<typeof JournalFormBaseSchema>;

export const JournalFormSchema = z.object({
  entries: z.record(EntryUrnSchema, JournalFormBaseSchema),
});

export type JournalForm = z.infer<typeof JournalFormSchema>;
