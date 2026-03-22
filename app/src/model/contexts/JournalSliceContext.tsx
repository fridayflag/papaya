import { JournalSlice } from '@/schema/aggregate-schemas'
import dayjs from 'dayjs'
import { createContext, PropsWithChildren } from 'react'

export type JournalSliceContext = {
  slice: JournalSlice
} & {
  [K in keyof JournalSlice as `set${Capitalize<string & K>}`]: (value: JournalSlice[K]) => void;
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

interface JournalSliceContextProviderProps extends PropsWithChildren {
  initialSearch: JournalSlice;
}

const journalSliceToSearchParams = (slice: JournalSlice): unknown => {
  return {
    d: slice.calendar.fromDate,
    r: slice.calendar.resolution ?? undefined,
    to: slice.calendar.toDate ?? undefined,
    ref: slice.refinements ?? undefined,
    s: slice.sortBy ?? undefined,
    o: slice.sortOrder ?? undefined,
    gr: slice.groupBy ?? undefined,
  };
}

export const JournalSliceContext = createContext<JournalSliceContext>({
  slice: defaultJournalSlice,
  setGroupBy: () => { },
  setSortBy: () => { },
  setSortOrder: () => { },
  setCalendar: () => { },
  setRefinements: () => { },
});
