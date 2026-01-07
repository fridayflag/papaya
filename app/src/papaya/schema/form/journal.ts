import { amountValidationPattern } from "@/constants/regex";
import z from "zod";
import { AccountSlugSchema, TopicSlugSchema } from "../journal/string";

export const JournalFormBaseSchema = z.object({
  memo: z.string(),
  amount: z.string().regex(amountValidationPattern),
  date: z.iso.date(),
  topics: z.array(TopicSlugSchema),
  sourceAccount: AccountSlugSchema.nullable(),
  destinationAccount: AccountSlugSchema.nullable(),
});
export type JournalFormBase = z.infer<typeof JournalFormBaseSchema>;

export const JournalFormSchema = z.object({
  baseEntry: JournalFormBaseSchema,
  children: z.array(JournalFormBaseSchema),
});

export type JournalForm = z.infer<typeof JournalFormSchema>;
