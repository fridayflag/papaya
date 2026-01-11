import { DisplayableAccount, DisplayableJournalEntry, DisplayableJournalEntryAggregate, DisplayableTopic, JournalIndex, JournalSlice } from "@/schema/journal/aggregate";
import { Figure } from "@/schema/journal/entity/figure";
import { Entry } from "@/schema/journal/resource/document";
import { EntryUrn } from "@/schema/support/urn";
import dayjs from "dayjs";
import { v6 as uuidv6 } from 'uuid';
import { sortDatesChronologically } from "./date";

const generateId = () => {
  return uuidv6();
}

const calculateNetFigure = (entry: Entry): Figure => {
  // TODO
  return entry.amount;
}

/**
 * Makes a displayable journal entry from a given entry. Other entries are provided, since
 * entries can make reference on each other.
 * @param entry 
 * @param context 
 */
export const makeDisplayableJournalEntry = (entry: Entry, _context: Record<EntryUrn, Entry>): DisplayableJournalEntry => {
  // TODO for now we ignore context
  return {
    displayableEntryId: generateId(),
    date: entry.date,
    memo: entry.memo,
    netAmount: calculateNetFigure(entry),
    topics: entry.topics ?? [],
    sourceAccount: entry.sourceAccount ?? null,
    destinationAccount: entry.destinationAccount ?? null,
    primaryAction: null,
    secondaryAction: null,
    stamps: [],
    children: [],
  };
}

const generateDisplayableJournalEntries = (entries: Record<EntryUrn, Entry>): Record<DisplayableJournalEntry['displayableEntryId'], DisplayableJournalEntry> => {
  const displayableEntries = Object.values(entries).map((entry) => {
    return makeDisplayableJournalEntry(entry, entries);
  });

  return Object.fromEntries(
    displayableEntries.map((entry) => [entry.displayableEntryId, entry])
  );
}

const generateDisplayableTopics = (displayableEntries: DisplayableJournalEntry[]): Record<DisplayableTopic['displayableTopicId'], DisplayableTopic> => {
  return displayableEntries.reduce<Record<DisplayableTopic['displayableTopicId'], DisplayableTopic>>((acc, entry) => {
    entry.topics.forEach((topic) => {
      if (!acc[topic]) {
        acc[topic] = {
          displayableTopicId: generateId(),
          slug: topic,
          entries: [],
        };
      } else {
        acc[topic].entries.push(entry.displayableEntryId);
      }
    });
    return acc;
  }, {});
}

const generateDisplayableAccounts = (displayableEntries: DisplayableJournalEntry[]): Record<DisplayableAccount['displayableAccountId'], DisplayableAccount> => {
  return displayableEntries.reduce<Record<DisplayableAccount['displayableAccountId'], DisplayableAccount>>((acc, entry) => {
    if (entry.sourceAccount) {
      acc[entry.sourceAccount] = {
        displayableAccountId: generateId(),
        slug: entry.sourceAccount,
        entries: [],
      };
    }
    if (entry.destinationAccount) {
      acc[entry.destinationAccount] = {
        displayableAccountId: generateId(),
        slug: entry.destinationAccount,
        entries: [],
      };
    }
    return acc;
  }, {});
}

export const generateJournalIndex = async (entries: Record<EntryUrn, Entry>): Promise<JournalIndex> => {
  const displayableEntries = generateDisplayableJournalEntries(entries);
  return {
    entries: displayableEntries,
    topics: generateDisplayableTopics(Object.values(displayableEntries)),
    accounts: generateDisplayableAccounts(Object.values(displayableEntries)),
  }
}

export const aggregateJournalIndexBySlice = (slice: JournalSlice, index: JournalIndex): DisplayableJournalEntryAggregate => {

  let groups;
  let comparator;

  switch (slice.sortBy) {
    case 'DATE':
    default:
      comparator = (a: DisplayableJournalEntry, b: DisplayableJournalEntry) => {
        return dayjs(a.date).diff(dayjs(b.date));
      };
      break;
  }

  const sortedEntries: DisplayableJournalEntry[] = Object.values(index.entries).sort(comparator);

  switch (slice.groupBy) {
    case 'DATE':
    default: {
      const dates = new Set<string>(
        sortedEntries.map((entry) => entry.date)
      );
      const sortedDates = slice.sortOrder === 'ASC'
        ? sortDatesChronologically(...dates)
        : sortDatesChronologically(...dates).reverse();

      groups = sortedDates.map((date) => {
        return {
          qualifier: { date },
          entries: sortedEntries.filter((entry) => entry.date === date),
        };
      });
      break;
    }
  }

  return {
    groups,
  };
}
