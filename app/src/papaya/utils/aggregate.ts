import { getJournalEntries } from "@/database/actions";
import { DisplayableJournalEntry, DisplayableJournalEntryAggregate, JournalIndex, JournalSlice } from "@/schema/journal/aggregate";
import { Entry } from "@/schema/journal/resource/document";
import { JournalUrn } from "@/schema/support/urn";

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

  let getGroup: (entry: DisplayableJournalEntry) => DisplayableJournalEntryAggregate['groups'];

  switch (slice.groupBy) {
    case 'DATE':
      getGroup = (entry: DisplayableJournalEntry) => {
        return {
          date: entry.date,
        };
      };
      break;
  }

  return {
    groups: index.entries
      .reduce((acc: DisplayableJournalEntryAggregate['groups'], entry: DisplayableJournalEntry) => {
        const groupIndex = acc.findIndex((group) => group.qualifier.date === entry.date);
        const group = {
          entries: [],
          qualifier: {
            date: entry.date,
          },
        }

        acc.push(group);
      }, {
        groups: [],
      });
  }
