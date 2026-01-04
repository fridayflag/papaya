import { getJournal } from "@/database/actions";
import { JournalIndex, JournalSlice, JournalView } from "@/schema/journal/aggregate";
import { Journal } from "@/schema/journal/resource/document";
import { JournalUrn } from "@/schema/support/urn";
import { aggregateJournalIndexBySlice, generateJournalIndex } from "@/utils/aggregate";
import { useQuery } from "@tanstack/react-query";

export const useJournal = (journalId: JournalUrn | undefined | null) => useQuery<Journal | undefined>({
  queryKey: ['journal', journalId],
  queryFn: async () => {
    return journalId ? await getJournal(journalId) : undefined;
  },
  initialData: undefined,
});

export const useJournalIndex = (journalId: JournalUrn | undefined | null) => useQuery<JournalIndex | undefined>({
  queryKey: ['journal', journalId, 'index'],
  queryFn: async () => {
    return journalId ? await generateJournalIndex(journalId) : undefined;
  },
  initialData: undefined,
});

export const useJournalView = (journalId: JournalUrn | undefined | null, slice: JournalSlice) => {
  const indexQuery = useJournalIndex(journalId);
  const journalQuery = useJournal(journalId);

  return useQuery<JournalView | undefined>({
    queryKey: ['journal', journalId, 'aggregate', JSON.stringify(slice)],
    queryFn: async () => {
      if (!indexQuery.data || !journalQuery.data) {
        return undefined;
      }

      const aggregate = aggregateJournalIndexBySlice(slice, indexQuery.data);
      return {
        journal: journalQuery.data,
        parameters: slice,
        aggregate,
      };
    },
    initialData: undefined,
  });
}