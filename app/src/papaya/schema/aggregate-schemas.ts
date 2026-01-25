import z from "zod";
import { StampVariantSchema } from "./journal/display";
import { FigureSchema } from "./journal/entity/figure";
import { DateViewSchema } from "./journal/facet";
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
  amount: FigureSchema,
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

export const JournalSliceSchema = z.object({
  timeframe: DateViewSchema,
  refinements: z.literal(null), // TODO: implement filters later
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
