import { DisplayableJournalEntry, DisplayableJournalEntryAggregate, DisplayableTransaction, JournalIndex, JournalSlice } from "@/schema/aggregate-schemas";
import { MonetaryEnumeration } from "@/schema/journal/money";
import { Entry } from "@/schema/journal/resource/documents";
import { Transaction } from "@/schema/journal/resource/transaction";
import { AccountSlug, TopicSlug } from "@/schema/journal/string";
import { EntryUrn } from "@/schema/support/urn";
import dayjs from "dayjs";
import { sortDatesChronologically } from "./date";

/**
 * Sums the transaction amounts into a MonetaryEnumeration.
 * @param transactions 
 * @returns 
 */
const sumTransactions = (transactions: Transaction[]): MonetaryEnumeration => {
  return transactions.reduce((acc: MonetaryEnumeration, transaction) => {
    if (!acc[transaction.figure.currency]) {
      acc[transaction.figure.currency] = 0;
    }
    acc[transaction.figure.currency]! += transaction.figure.amount;
    return acc;
  }, {} as MonetaryEnumeration);
}

// export const makeDisplayableTransaction = (transaction: Transaction): DisplayableTransaction => {
//   return {
//     transactionUrn: transaction.urn,
//     memo: transaction.memo,
//     date: transaction.date,
//     amount: transaction.amount,
//     sourceAccount: transaction.sourceAccount ?? null,
//     destinationAccount: transaction.destinationAccount ?? null,
//     topics: transaction.topics ?? [],
//     // children: [], // TODO
//   }
// }

export const makeDisplayableJournalEntry = (entry: Entry): DisplayableJournalEntry | null => {
  const transactions: Transaction[] = Object.values(entry.transactions);

  const root = transactions.find((transaction) => transaction.parentUrn === null);
  if (!root) {
    return null;
  }

  const sum: MonetaryEnumeration = sumTransactions(transactions);
  const topics = new Set<TopicSlug>(transactions
    .flatMap((transaction) => transaction.topics)
    .filter((topic): topic is TopicSlug => Boolean(topic))
  );
  const accounts = new Set<AccountSlug>(transactions
    .flatMap((transaction) => [transaction.sourceAccount, transaction.destinationAccount])
    .filter((account): account is AccountSlug => Boolean(account))
  );
  const memo = root.memo;
  const date = root.date;

  // TODO for now, we just return the root transaction as the displayable transaction
  const rootTransaction: DisplayableTransaction = {
    transactionUrn: root.urn,
    memo: root.memo,
    date: root.date,
    figure: root.figure,
    sourceAccount: root.sourceAccount ?? null,
    destinationAccount: root.destinationAccount ?? null,
    topics: root.topics ?? [],
    children: [],
  }

  return {
    entryUrn: entry.urn,
    aggregate: {
      memo,
      date,
      topics,
      accounts,
      sum,
    },
    primaryAction: null,
    secondaryAction: null,
    stamps: [],
    rootTransaction,
  };
}

const generateDisplayableJournalEntries = (entries: Record<EntryUrn, Entry>): Record<EntryUrn, DisplayableJournalEntry> => {
  return Object.fromEntries(
    Object.values(entries).map((entry) => [entry.urn, makeDisplayableJournalEntry(entry) as DisplayableJournalEntry])
  );
}

// const generateDisplayableTopics = (displayableEntries: DisplayableJournalEntry[]): Record<DisplayableTopic['displayableTopicId'], DisplayableTopic> => {
//   return displayableEntries.reduce<Record<DisplayableTopic['displayableTopicId'], DisplayableTopic>>((acc, entry) => {
//     entry.topics.forEach((topic) => {
//       if (!acc[topic]) {
//         acc[topic] = {
//           displayableTopicId: generateId(),
//           slug: topic,
//           entries: [],
//         };
//       } else {
//         acc[topic].entries.push(entry.displayableEntryId);
//       }
//     });
//     return acc;
//   }, {});
// }

// const generateDisplayableAccounts = (displayableEntries: DisplayableJournalEntry[]): Record<DisplayableAccount['displayableAccountId'], DisplayableAccount> => {
//   return displayableEntries.reduce<Record<DisplayableAccount['displayableAccountId'], DisplayableAccount>>((acc, entry) => {
//     if (entry.sourceAccount) {
//       acc[entry.sourceAccount] = {
//         displayableAccountId: generateId(),
//         slug: entry.sourceAccount,
//         entries: [],
//       };
//     }
//     if (entry.destinationAccount) {
//       acc[entry.destinationAccount] = {
//         displayableAccountId: generateId(),
//         slug: entry.destinationAccount,
//         entries: [],
//       };
//     }
//     return acc;
//   }, {});
// }

export const generateJournalIndex = async (entries: Record<EntryUrn, Entry>): Promise<JournalIndex> => {
  const displayableEntries = generateDisplayableJournalEntries(entries);
  return {
    entries: displayableEntries,
    // topics: generateDisplayableTopics(Object.values(displayableEntries)),
    // accounts: generateDisplayableAccounts(Object.values(displayableEntries)),
  }
}

export const aggregateJournalIndexBySlice = (slice: JournalSlice, index: JournalIndex): DisplayableJournalEntryAggregate => {

  let groups;
  let comparator;

  switch (slice.sortBy) {
    case 'DATE':
    default:
      comparator = (a: DisplayableJournalEntry, b: DisplayableJournalEntry) => {
        return dayjs(a.aggregate.date).diff(dayjs(b.aggregate.date));
      };
      break;
  }

  const sortedEntries: DisplayableJournalEntry[] = Object.values(index.entries).sort(comparator);

  switch (slice.groupBy) {
    case 'DATE':
    default: {
      const dates = new Set<string>(
        sortedEntries.map((entry) => entry.aggregate.date)
      );
      const sortedDates = slice.sortOrder === 'ASC'
        ? sortDatesChronologically(...dates)
        : sortDatesChronologically(...dates).reverse();

      groups = sortedDates.map((date) => {
        return {
          qualifier: { date },
          entries: sortedEntries.filter((entry) => entry.aggregate.date === date),
        };
      });
      break;
    }
  }

  return {
    groups,
  };
}
