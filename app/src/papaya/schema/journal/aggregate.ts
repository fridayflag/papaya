import { EntryUrnSchema } from "@/schema/support/urn";
import z from "zod";
import { EntrySchema, JournalSchema } from "./resource/document";
import { AccountSlugSchema, TopicSlugSchema } from "./string";

export const JournalAggregateSchema = z.object({
  journal: JournalSchema,
  entries: z.record(EntryUrnSchema, EntrySchema),
})

export type JournalAggregate = z.infer<typeof JournalAggregateSchema>;

const DisplayableJournalEntryActionSchema = z.object({
  variant: z.enum(['ACCEPT', 'REJECT', 'NUDGE']),
  label: z.string(),
  // icon: PictogramSchema,
});

const DisplayableJournalEntrySchema = z.object({
  date: z.iso.date(),
  memo: z.string(),
  topics: z.array(TopicSlugSchema),
  sourceAccount: AccountSlugSchema.nullable(),
  destinationAccount: AccountSlugSchema.nullable(),
  primaryAction: DisplayableJournalEntryActionSchema.nullable(),
  secondaryAction: DisplayableJournalEntryActionSchema.nullable(),
  badges: z.array(z.enum([
    'FLAGGED',
    'IMPORTANT',
  ])),

  get children() {
    return z.array(DisplayableJournalEntrySchema);
  }
});

export const JournalSliceSchema = z.object({
  journal: JournalSchema,
  period: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']),
  afterDate: z.iso.date().nullable(),
  beforeDate: z.iso.date().nullable(),
  filters: z.literal([]), // TODO: implement filters later
})
export type JournalSlice = z.infer<typeof JournalSliceSchema>;

export const JournalViewSchema = z.object({
  parameters: JournalSliceSchema,
  layout: z.literal('TABLE'),
  entries: z.array(DisplayableJournalEntrySchema),
  sortBy: z.enum(['DATE', 'MEMO', 'AMOUNT']),
  sortOrder: z.enum(['ASC', 'DESC']),
  groupBy: z.enum(['DATE']).nullable(),
});

export type JournalView = z.infer<typeof JournalViewSchema>;



