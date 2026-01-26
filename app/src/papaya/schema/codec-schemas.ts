import { SCHEMA_VERSION } from "@/database/SchemaMigration";
import { parseJournalEntryAmount, serializeJournalEntryAmount } from "@/utils/journal";
import z from "zod";
import { JournalEntryFormSchema, TransactionFormSchema, type JournalEntryForm, type TransactionForm } from "./form-schemas";
import { EntrySchema, type Entry } from "./journal/resource/documents";
import { TransactionSchema, type Transaction } from "./journal/resource/transaction";
import { TopicSlugSchema } from "./journal/string";
import { makeFigure } from "./support/factory";
import { type EntryUrn } from "./support/urn";

// Codec for converting between Transaction and TransactionForm
// Note: When encoding, entryUrn is required but not in the form, so we use a helper function
export const TransactionFormCodec = z.codec(
  TransactionSchema,
  TransactionFormSchema,
  {
    decode: (transaction: Transaction): TransactionForm => {
      const amountString = serializeJournalEntryAmount(transaction.figure.amount);
      const topicsString = transaction.topics?.join(', ') ?? '';

      return {
        urn: transaction.urn,
        parentUrn: transaction.parentUrn!,
        entryUrn: transaction.entryUrn,
        memo: transaction.memo,
        currency: transaction.figure.currency,
        amountString,
        date: transaction.date,
        topicsString: topicsString,
        sourceAccount: transaction.sourceAccount ?? null,
        destinationAccount: transaction.destinationAccount ?? null,
      };
    },
    encode: (form: TransactionForm): Transaction => {
      const figure = parseJournalEntryAmount(form.amountString, form.currency) ?? makeFigure(0, form.currency);
      const topics: z.infer<typeof TopicSlugSchema>[] = form.topicsString
        ? form.topicsString
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
          .map(topic => {
            const topicSlug = topic.startsWith('#') ? topic : `#${topic}`;
            return TopicSlugSchema.parse(topicSlug);
          })
        : [];

      return {
        urn: form.urn,
        kind: 'papaya:resource:transaction',
        '@version': SCHEMA_VERSION,
        entryUrn: form.entryUrn,
        parentUrn: form.parentUrn,
        memo: form.memo,
        figure,
        date: form.date,
        stems: {},
        time: null,
        sourceAccount: form.sourceAccount ?? null,
        destinationAccount: form.destinationAccount ?? null,
        topics: topics.length > 0 ? topics : null,
      };
    },
  }
);

// Helper function to encode TransactionForm to Transaction with entryUrn
const encodeTransactionForm = (form: Omit<TransactionForm, 'parentUrn'> & { parentUrn: TransactionForm['parentUrn'] | null }, entryUrn: EntryUrn): Transaction => {
  const figure = parseJournalEntryAmount(form.amountString, form.currency) ?? makeFigure(0, form.currency);

  // Parse and validate topics as TopicSlug
  const topics: z.infer<typeof TopicSlugSchema>[] = form.topicsString
    ? form.topicsString
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(topic => {
        // Ensure topic starts with #, add it if missing
        const topicSlug = topic.startsWith('#') ? topic : `#${topic}`;
        // Validate it matches TopicSlugSchema
        const parsed = TopicSlugSchema.safeParse(topicSlug);
        return parsed.success ? parsed.data : null;
      })
      .filter((topic): topic is z.infer<typeof TopicSlugSchema> => topic !== null)
    : [];

  return {
    urn: form.urn,
    kind: 'papaya:resource:transaction',
    '@version': SCHEMA_VERSION,
    entryUrn,
    parentUrn: form.parentUrn,
    memo: form.memo,
    figure,
    date: form.date,
    stems: {},
    time: null,
    sourceAccount: form.sourceAccount ?? null,
    destinationAccount: form.destinationAccount ?? null,
    topics: topics.length > 0 ? topics : null,
  };
};

export const JournalFormCodec = z.codec(
  EntrySchema,
  JournalEntryFormSchema,
  {
    decode: (entry: Entry): JournalEntryForm => {
      const transactions = Object.values(entry.transactions);
      const rootTransaction = transactions.find((t) => t.parentUrn === null);
      if (!rootTransaction) {
        throw new Error('JournalFormCodec.decode: Entry must have a root transaction (parentUrn === null)');
      }

      // Convert root transaction to form (with parentUrn: null)
      const rootTransactionForm: TransactionForm = TransactionFormCodec.decode(rootTransaction);
      return {
        urn: entry.urn,
        rootTransaction: {
          ...rootTransactionForm,
          parentUrn: null,
        },
        childTransactions: transactions
          .filter((t) => t.parentUrn !== null)
          .reduce((acc: Record<string, TransactionForm>, transaction) => {
            acc[transaction.urn] = TransactionFormCodec.decode(transaction);
            return acc;
          }, {}),
      };
    },
    encode: (form: JournalEntryForm): Entry => {
      const { urn: entryUrn } = form;
      // Create root transaction (using helper since it has parentUrn: null)
      const rootTransaction = encodeTransactionForm(form.rootTransaction, entryUrn);

      // Create child transactions using TransactionFormCodec via helper
      const childTransactions = Object.values(form.childTransactions).reduce((acc, formTransaction) => {
        const transaction = encodeTransactionForm(formTransaction, entryUrn);
        acc[transaction.urn] = transaction;
        return acc;
      }, {} as Record<string, Transaction>);

      // Create Entry with all transactions
      // Note: journalId is required by schema but not used for display purposes
      // Using a placeholder that matches the schema format
      const placeholderJournalId = 'papaya:document:journal:00000000-0000-0000-0000-000000000000' as const;

      return {
        _id: entryUrn,
        journalId: placeholderJournalId,
        urn: entryUrn,
        kind: 'papaya:document:entry',
        '@version': SCHEMA_VERSION,
        transactions: {
          [rootTransaction.urn]: rootTransaction,
          ...childTransactions,
        },
      };
    },
  }
);
