import { getJournalEntries } from "@/database/actions";
import { DisplayableJournalEntry, DisplayableJournalEntryAggregate, JournalIndex, JournalSlice } from "@/schema/journal/aggregate";
import { Entry } from "@/schema/journal/resource/document";
import { JournalUrn } from "@/schema/support/urn";
import dayjs from "dayjs";
import { sortDatesChronologically } from "./date";

const generateDisplayableJournalEntries = (entries: Entry[]): DisplayableJournalEntry[] => {
  return entries.map((entry) => {
    return {
      date: entry.date,
      memo: entry.memo,
      topics: entry.topics ?? [],
      sourceAccount: entry.sourceAccount ?? null,
      destinationAccount: entry.destinationAccount ?? null,
      primaryAction: null,
      secondaryAction: null,
      stamps: [],
      children: [],
    };
  });
}

export const generateJournalIndex = async (journalId: JournalUrn): Promise<JournalIndex> => {
  const entries = await getJournalEntries(journalId);
  return {
    entries: generateDisplayableJournalEntries(entries),
  } satisfies JournalIndex;
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

  const sortedEntries = index.entries.sort(comparator);

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
