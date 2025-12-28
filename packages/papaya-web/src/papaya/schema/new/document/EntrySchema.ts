import { z } from "zod";

import { ComputedAmountSchema } from "../object/ComputedAmountSchema";
import { EditableAmountSchema } from "../object/EditableAmountSchema";
import { EntryPrnSchema, JournalPrnSchema } from "../other/PapayaResourceNameSchema";
import { makeDocumentSchema } from "../schema-utils";
import { AttachmentStemSchema } from "../stem/AttachmentStemSchema";
import { FlagStemSchema } from "../stem/FlagStemSchema";
import { ForkStemSchema } from "../stem/ForkStemSchema";
import { GratuityStemSchema } from "../stem/GratuityStemSchema";
import { MentionStemSchema } from "../stem/MentionStemSchema";
import { NoteStemSchema } from "../stem/NoteStemSchema";
import { ObligationStemSchema } from "../stem/ObligationStemSchema";
import { RecurrenceStemSchema } from "../stem/RecurrenceStemSchema";
import { RelationStemSchema } from "../stem/RelationStemSchema";
import { TaskListStemSchema } from "../stem/TaskListStemSchema";
import { TopicStemSchema } from "../stem/TopicStemSchema";
import { TransferDestinationStemSchema } from "../stem/TransferDestinationStemSchema";

const StemsUnionSchema = z.union([
  AttachmentStemSchema,
  FlagStemSchema,
  ForkStemSchema,
  GratuityStemSchema,
  MentionStemSchema,
  NoteStemSchema,
  ObligationStemSchema,
  RecurrenceStemSchema,
  RelationStemSchema,
  TaskListStemSchema,
  TopicStemSchema,
  TransferDestinationStemSchema,
]);

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
