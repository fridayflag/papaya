import z from "zod";
import { StampVariantSchema } from "./journal/display";
import { FigureSchema } from "./journal/entity/figure";
import { MonetaryEnumerationSchema } from "./journal/money";
import { JournalSchema } from "./journal/resource/documents";
import { AccountSlugSchema, TopicSlugSchema } from "./journal/string";
import { EntryUrnSchema, TransactionUrnSchema } from "./support/urn";

export const DisplayableJournalEntryActionSchema = z.object({
  variant: z.enum(['ACCEPT', 'REJECT', 'NUDGE']),
  label: z.string(),
});

export const DisplayableTransactionSchema = z.object({
  transactionUrn: TransactionUrnSchema.nullable(),
  memo: z.string(),
  date: z.iso.date(),
  figure: FigureSchema,
  sourceAccount: AccountSlugSchema.nullable(),
  destinationAccount: AccountSlugSchema.nullable(),
  topics: z.array(TopicSlugSchema),

  get children() {
    return z.array(DisplayableTransactionSchema);
  }
});
export type DisplayableTransaction = z.infer<typeof DisplayableTransactionSchema>;

export const DisplayableJournalEntrySchema = z.object({
  entryUrn: EntryUrnSchema,
  aggregate: z.object({
    memo: z.string(),
    date: z.iso.date(),
    topics: z.set(TopicSlugSchema),
    accounts: z.set(AccountSlugSchema),
    sum: MonetaryEnumerationSchema,
  }),
  primaryAction: DisplayableJournalEntryActionSchema.nullable(),
  secondaryAction: DisplayableJournalEntryActionSchema.nullable(),
  stamps: z.array(StampVariantSchema),
  rootTransaction: DisplayableTransactionSchema,
});
export type DisplayableJournalEntry = z.infer<typeof DisplayableJournalEntrySchema>;

/**
 * Represents a range preset for a calendar view.
 */
export const CalendarResolutionSchema = z.enum({
  WEEK: 'w',
  MONTH: 'm',
  YEAR: 'y',
  CUSTOM: 'c',
});
export type CalendarResolution = z.infer<typeof CalendarResolutionSchema>;

/**
 * Represents a specified or inferred range of dates for a calendar view.
 */
export const CalendarRangeSchema = z.object({
  /**
   * The start date of the range.
   */
  fromDate: z.iso.date(),
  /**
   * The resolution of the range. If not provided, the range is considered custom.
   */
  resolution: CalendarResolutionSchema.optional(),
  /**
   * The end date of the range. If a resolution is provided, this field is ignored.
   */
  toDate: z.iso.date().optional(),
})
export type CalendarRange = z.infer<typeof CalendarRangeSchema>;

export const RefinementSchema = z.literal(null);

export type Refinement = z.infer<typeof RefinementSchema>;

export const SortBySchema = z.enum(['DATE', 'MEMO', 'AMOUNT']).optional().default('DATE');
export type SortBy = z.infer<typeof SortBySchema>;

export const SortOrderSchema = z.enum(['ASC', 'DESC']).optional().default('ASC');
export type SortOrder = z.infer<typeof SortOrderSchema>;

export const GroupBySchema = z.enum(['DATE']).optional().default('DATE');
export type GroupBy = z.infer<typeof GroupBySchema>;

export const JournalSliceSchema = z.object({
  calendar: CalendarRangeSchema,
  refinements: RefinementSchema,
  sortBy: SortBySchema,
  sortOrder: SortOrderSchema,
  groupBy: GroupBySchema,
  // layout: z.enum(['TABLE', 'LIST']).optional().default('TABLE'),
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

export const DisplayableTopicSchema = z.object({
  slug: TopicSlugSchema,
  entries: z.set(EntryUrnSchema),
});
export type DisplayableTopic = z.infer<typeof DisplayableTopicSchema>;

export const DisplayableAccountSchema = z.object({
  slug: AccountSlugSchema,
  entries: z.set(EntryUrnSchema),
});
export type DisplayableAccount = z.infer<typeof DisplayableAccountSchema>;

/**
 * Represents the set of searchable, displayable journal objects.
 */
export const JournalIndexSchema = z.object({
  entries: z.record(EntryUrnSchema, DisplayableJournalEntrySchema),
  // topics: z.record(TopicSlugSchema, DisplayableTopicSchema),
  // accounts: z.record(AccountSlugSchema, DisplayableAccountSchema),
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
