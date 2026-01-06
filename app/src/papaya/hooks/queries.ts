import { getJournal } from "@/database/actions";
import { JournalIndex, JournalSlice, JournalView } from "@/schema/journal/aggregate";
import { Journal } from "@/schema/journal/resource/document";
import { JournalUrn } from "@/schema/support/urn";
import { aggregateJournalIndexBySlice, generateJournalIndex } from "@/utils/aggregate";
import { useQuery } from "@tanstack/react-query";

export const useJournal = (journalId: JournalUrn | null) => useQuery<Journal | null>({
  queryKey: ['journal', journalId],
  queryFn: async () => {
    return getJournal(journalId);
  },
  initialData: null,
});

export const useJournalIndex = (journalId: JournalUrn | null | null) => useQuery<JournalIndex | null>({
  queryKey: ['journal', journalId, 'index'],
  queryFn: async () => {
    return journalId ? await generateJournalIndex(journalId) : null;
  },
  initialData: null,
});

export const useJournalView = (journalId: JournalUrn | null | null, slice: JournalSlice) => {
  const indexQuery = useJournalIndex(journalId);
  const journalQuery = useJournal(journalId);

  return useQuery<JournalView | null>({
    queryKey: ['journal', journalId, 'aggregate', JSON.stringify(slice)],
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
  });
}