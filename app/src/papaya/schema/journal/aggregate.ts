import z from "zod";
import { StampVariantSchema } from "./display";
import { DateViewSchema } from "./facet";
import { JournalSchema } from "./resource/document";
import { AccountSlugSchema, TopicSlugSchema } from "./string";

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
  stamps: z.array(StampVariantSchema).nullable(),

  get children() {
    return z.array(DisplayableJournalEntrySchema);
  }
});

export type DisplayableJournalEntry = z.infer<typeof DisplayableJournalEntrySchema>;

export const JournalSliceSchema = z.object({
  timeframe: DateViewSchema,
  filters: z.literal(null), // TODO: implement filters later
  sortBy: z.enum(['DATE', 'MEMO', 'AMOUNT']).optional().default('DATE'),
  sortOrder: z.enum(['ASC', 'DESC']).optional().default('ASC'),
  groupBy: z.enum(['DATE']).optional().default('DATE'),
  layout: z.enum(['TABLE', 'LIST']).optional().default('TABLE'),
})
export type JournalSlice = z.infer<typeof JournalSliceSchema>;

export const DisplayableJournalEntryAggregateSchema = z.object({
  groups: z.array(z.object({
    entries: z.array(DisplayableJournalEntrySchema),
    qualifier: z.union([
      z.object({ date: z.iso.date() }),
      z.object({
        alphabet: z.union([
          z.literal('0-9'),
          z.literal('A-H'),
          z.literal('I-N'),
          z.literal('O-Z'),
        ])
      }),
    ])
  }))
});
export type DisplayableJournalEntryAggregate = z.infer<typeof DisplayableJournalEntryAggregateSchema>;

/**
 * Represents the set of searchable, displayable journal objects.
 */
export const JournalIndexSchema = z.object({
  entries: z.array(DisplayableJournalEntrySchema),
})

export type JournalIndex = z.infer<typeof JournalIndexSchema>;

/**
 * Represents the sorted, filtered, grouped, and displayable journal entries.
 */
export const JournalViewSchema = z.object({
  journal: JournalSchema,
  parameters: JournalSliceSchema,
  aggregate: DisplayableJournalEntryAggregateSchema,
});
export type JournalView = z.infer<typeof JournalViewSchema>;
