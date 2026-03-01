import DisplayableJournal from '@/components/features/journal/layout/DisplayableJournal';
import { JournalSliceContextProvider } from '@/contexts/JournalSliceContext';
import { CalendarResolution, GroupBy, JournalSlice, SortBy, SortOrder } from '@/schema/aggregate-schemas';

import { createFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useMemo } from 'react';

interface JournalSliceSearchParams {
  d: string; // fromDate
  r: CalendarResolution; // resolution
  to: string; // toDate
  ref: null; // refinements
  s: SortBy; // sortBy
  o: SortOrder; // sortOrder
  gr: GroupBy; // groupBy
}

const defaultJournalSlice: JournalSlice = {
  calendar: {
    fromDate: dayjs().startOf('month').toISOString(),
    resolution: 'm',
  },
  refinements: null,
  sortBy: 'DATE',
  sortOrder: 'ASC',
  groupBy: 'DATE',
};

export const Route = createFileRoute('/_mainLayout/journal/')({
  component: JournalPage,
  validateSearch: (search: Record<string, unknown>): Partial<JournalSliceSearchParams> => {
    const params: Partial<JournalSliceSearchParams> = {
      d: search.d as string,
      r: search.r as CalendarResolution,
      to: search.to as string,
      ref: null,
      s: search.s as SortBy,
      o: search.o as SortOrder,
      gr: search.gr as GroupBy,
    }

    if (params.d === defaultJournalSlice.calendar.fromDate) {
      delete params.d;
    }
    if (params.r === defaultJournalSlice.calendar.resolution) {
      delete params.r;
    }
    if (params.to === defaultJournalSlice.calendar.toDate) {
      delete params.to;
    }
    if (params.ref === defaultJournalSlice.refinements) {
      delete params.ref;
    }
    if (params.s === defaultJournalSlice.sortBy) {
      delete params.s;
    }
    if (params.o === defaultJournalSlice.sortOrder) {
      delete params.o;
    }
    if (params.gr === defaultJournalSlice.groupBy) {
      delete params.gr;
    }

    return params;
  },
});

function JournalPage() {
  const searchParams = Route.useSearch()
  const initialSearch: JournalSlice = useMemo(() => {
    return {
      ...defaultJournalSlice,
      ...({
        calendar: {
          ...defaultJournalSlice.calendar,
          ...(searchParams.d ? { fromDate: searchParams.d } : {}),
          ...(searchParams.r ? { resolution: searchParams.r } : {}),
          ...(searchParams.to ? { toDate: searchParams.to } : {}),
        },
        refinements: null,
        sortBy: searchParams.s ?? defaultJournalSlice.sortBy,
        sortOrder: searchParams.o ?? defaultJournalSlice.sortOrder,
        groupBy: searchParams.gr ?? defaultJournalSlice.groupBy,
      }),
    }
  }, [searchParams]);
  return (
    <JournalSliceContextProvider initialSearch={initialSearch}>
      <DisplayableJournal />
    </JournalSliceContextProvider>
  )
}
