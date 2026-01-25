import { amountValidationPattern } from "@/constants/regex";
import z from "zod";
import { CurrencyIso4217Schema } from "./journal/money";
import { AccountSlugSchema } from "./journal/string";
import { TransactionUrnSchema } from "./support/urn";

export const TransactionFormSchema = z.object({
  urn: TransactionUrnSchema,
  parentUrn: TransactionUrnSchema,
  memo: z.string(),
  currency: CurrencyIso4217Schema,
  amount: z.string().regex(amountValidationPattern),
  date: z.iso.date(),
  topics: z.string(),
  sourceAccount: AccountSlugSchema.nullable(),
  destinationAccount: AccountSlugSchema.nullable(),
});
export type TransactionForm = z.infer<typeof TransactionFormSchema>;

export const JournalEntryFormSchema = z.object({
  rootTransaction: TransactionFormSchema.extend({
    parentUrn: z.literal(null),
  }),
  childTransactions: z.record(TransactionUrnSchema, TransactionFormSchema),
});
export type JournalEntryForm = z.infer<typeof JournalEntryFormSchema>;
