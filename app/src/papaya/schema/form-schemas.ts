import z from "zod";
import { PriceConversionSchema } from "./etc-schemas";
import { TransactionRidSchema } from "./namespace-schemas";
import { JournalEntrySchema, TransactionSchema } from "./resource-schemas";
import { createResourceFormSchema } from "./template-schemas";

export const TransactionFormSchema = createResourceFormSchema(
  TransactionSchema,
  { parent: true },
  {
    amountString: z.string(),
    topics: z.array(z.string()),
    convertedFrom: PriceConversionSchema.nullish(),
    date: z.iso.date().nullish(),
    time: z.iso.time().nullish(),
    sourceAccount: z.string().nullish(),
    destinationAccount: z.string().nullish(),
  }
);

export const JournalEntryFormSchema = createResourceFormSchema(
  JournalEntrySchema,
  { journalRid: true, transactions: true },
  {
    date: z.iso.date().nullish(),
    time: z.iso.time().nullish(),
    memo: z.string().nullish(),
    transactions: z.record(TransactionRidSchema, TransactionFormSchema),
  });

export type TransactionForm = z.infer<typeof TransactionFormSchema>;
export type JournalEntryForm = z.infer<typeof JournalEntryFormSchema>;