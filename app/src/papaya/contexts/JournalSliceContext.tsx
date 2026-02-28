import { CalendarRange, GroupBy, JournalSlice, Refinement, SortBy, SortOrder } from '@/schema/aggregate-schemas'
import { useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { createContext, PropsWithChildren, useCallback, useMemo, useState } from 'react'

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

export function JournalSliceContextProvider(props: JournalSliceContextProviderProps) {

  const router = useRouter();

  const [slice, setSlice] = useState<JournalSlice>(props.initialSearch);

  const handleChangeSlice = (slice: Partial<JournalSlice>) => {
    setSlice((prev) => {
      const next = {
        ...prev,
        ...slice,
      }
      router.navigate({
        to: '/journal',
        search: journalSliceToSearchParams(next),
      });
      return next;
    });
  }


  const setGroupBy = useCallback(
    (groupBy: GroupBy) => {
      handleChangeSlice({ groupBy });
    },
    [handleChangeSlice],
  )

  const setSortBy = useCallback(
    (sortBy: SortBy) => {
      handleChangeSlice({ sortBy });
    },
    [handleChangeSlice],
  )

  const setSortOrder = useCallback(
    (sortOrder: SortOrder) => {
      handleChangeSlice({ sortOrder });
    },
    [handleChangeSlice],
  )

  const setCalendar = useCallback(
    (calendar: CalendarRange) => {
      handleChangeSlice({ calendar });
    },
    [handleChangeSlice],
  )

  const setRefinements = useCallback(
    (refinements: Refinement) => {
      handleChangeSlice({ refinements });
    },
    [handleChangeSlice],
  )


  const value = useMemo(() => ({
    slice,
    setGroupBy,
    setSortBy,
    setSortOrder,
    setCalendar,
    setRefinements,
  }), [slice, setGroupBy, setSortBy, setSortOrder, setCalendar, setRefinements]);

  return (
    <JournalSliceContext.Provider value={value}>
      {props.children}
    </JournalSliceContext.Provider>
  )
}
