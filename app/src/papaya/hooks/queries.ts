import { JournalContext } from "@/contexts/JournalContext";
import { getJournal, getJournalEntries } from "@/database/actions";
import { JournalIndex, JournalSlice, JournalView } from "@/schema/journal/aggregate";
import { Entry, Journal } from "@/schema/journal/resource/document";
import { EntryUrn, JournalUrn } from "@/schema/support/urn";
import { aggregateJournalIndexBySlice, generateJournalIndex } from "@/utils/aggregate";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

export const useJournal = (journalId: JournalUrn | null) => useQuery<Journal | null>({
  queryKey: ['journal', journalId],
  queryFn: async () => {
    return getJournal(journalId);
  },
  initialData: null,
});

export const useJournalEntries = (journalId: JournalUrn | null) => useQuery<Record<EntryUrn, Entry>>({
  queryKey: ['journal', journalId, 'entries'],
  queryFn: async (): Promise<Record<EntryUrn, Entry>> => {
    const entries = await getJournalEntries(journalId);
    return Object.fromEntries(entries.map((entry) => [entry.urn, entry]));
  },
  enabled: Boolean(journalId),
  initialData: {},
});

export const useActiveJournal = () => {
  const activeJournalId = useContext(JournalContext).activeJournalId;
  return useJournal(activeJournalId);
}

export const useActiveJournalEntries = () => {
  const activeJournalId = useContext(JournalContext).activeJournalId;
  return useJournalEntries(activeJournalId);
}

export const useActiveJournalIndex = () => {
  const activeJournalId = useContext(JournalContext).activeJournalId;
  const entriesQuery = useActiveJournalEntries();

  return useQuery<JournalIndex | null>({
    queryKey: ['journal', activeJournalId, 'index'],
    queryFn: async () => {
      return entriesQuery.data ? await generateJournalIndex(entriesQuery.data) : null;
    },
    enabled: entriesQuery.isFetched,
    initialData: null,
  });
}

export const useActiveJournalView = (slice: JournalSlice) => {
  const activeJournalId = useContext(JournalContext).activeJournalId;

  const indexQuery = useActiveJournalIndex();
  const journalQuery = useActiveJournal();

  return useQuery<JournalView | null>({
    queryKey: ['journal', activeJournalId, 'aggregate', JSON.stringify(slice)],
    queryFn: async () => {
      if (!indexQuery.data || !journalQuery.data) {
        return null;
      }

      const aggregate = aggregateJournalIndexBySlice(slice, indexQuery.data);
      return {
        journal: journalQuery.data,
        parameters: slice,
        aggregate,
      };
    },
    initialData: null,
    enabled: Boolean(activeJournalId) && indexQuery.isFetched && journalQuery.isFetched,
  });
}
