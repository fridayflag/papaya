import { z } from "zod";
export const EntrySchema = makeDocumentSchema('papaya:entry', {
  memo: z.string(),
  date: z.iso.date(),
  time: z.iso.time(),
  journalId: JournalPrnSchema,
  sourceAccount: z.templateLiteral(['&', z.string()]).nullable(),
  amount: EditableAmountSchema,
  '@derived': z.object({
    netAmount: ComputedAmountSchema,
  }),
  stems: z.record(z.string(), StemsUnionSchema).optional(),
});

export type Entry = z.infer<typeof EntrySchema>;

export const EntryIdentifierSchema = EntryPrnSchema;

export type EntryIdentifier = z.infer<typeof EntryIdentifierSchema>;
