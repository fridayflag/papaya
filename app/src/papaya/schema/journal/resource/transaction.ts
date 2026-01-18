import { createPapayaResourceSchema } from "@/schema/support/template";
import { EntryUrnSchema, StemUrnSchema, TransactionUrnSchema } from "@/schema/support/urn";
import z from "zod";
import { FigureSchema } from "../entity/figure";
import { AccountSlugSchema, TopicSlugSchema } from "../string";
import { StemSchema } from "./stems";



export const TransactionSchema = createPapayaResourceSchema('papaya:resource:transaction', {
  entryUrn: EntryUrnSchema,
  parentUrn: TransactionUrnSchema.nullable(),
  memo: z.string(),
  amount: FigureSchema,
  date: z.iso.date(),
  stems: z.record(StemUrnSchema, StemSchema),
  time: z.iso.time().nullish(),
  sourceAccount: AccountSlugSchema.nullish(),
  destinationAccount: AccountSlugSchema.nullish(),
  topics: z.array(TopicSlugSchema).nullish(),
});
export type Transaction = z.infer<typeof TransactionSchema>;
