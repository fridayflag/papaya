import z from "zod";
import { CurrencyIso4217Schema } from "./journal/money";
import { AccountSlugSchema } from "./journal/string";
import { EntryUrnSchema, JournalUrnSchema, TransactionUrnSchema } from "./support/urn";

export const TransactionFormSchema = z.object({
  urn: TransactionUrnSchema,
  parentUrn: TransactionUrnSchema.nullable(),
  entryUrn: EntryUrnSchema,
  memo: z.string(),
  currency: CurrencyIso4217Schema,
  amountString: z.string(), // .regex(amountValidationPattern),
  date: z.iso.date(),
  topicsString: z.string(),
  sourceAccount: AccountSlugSchema.nullable(),
  destinationAccount: AccountSlugSchema.nullable(),
});
export type TransactionForm = z.infer<typeof TransactionFormSchema>;

export const JournalEntryFormSchema = z.object({
  entryUrn: EntryUrnSchema,
  journalUrn: JournalUrnSchema,
  rootTransaction: TransactionFormSchema,
  childTransactions: z.record(TransactionUrnSchema, TransactionFormSchema)
});
// TODO add a .refine() that asserts that the childTransactions have a parentUrn that is not null
export type JournalEntryForm = z.infer<typeof JournalEntryFormSchema>;

export const UserCredentialsFormSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export type UserCredentialsForm = z.infer<typeof UserCredentialsFormSchema>;
