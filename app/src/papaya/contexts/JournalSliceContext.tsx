import { JournalSlice } from '@/schema/aggregate-schemas'
import { DateView, DateViewVariant } from '@/schema/journal/facet'
import { getStartDateFromDateView } from '@/utils/date'
import dayjs from 'dayjs'
import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from 'react'

export interface JournalSliceSearchParams {
  v: DateViewVariant
  y?: string
  m?: string
  d?: string
  g: 'DATE'
  s: 'DATE' | 'MEMO' | 'AMOUNT'
  o: 'ASC' | 'DESC'
  l: 'TABLE' | 'LIST'
}

export const JOURNAL_SLICE_DEFAULT_SEARCH_PARAMS: Partial<JournalSliceSearchParams> = {
  v: DateViewVariant.MONTHLY,
  g: 'DATE',
  s: 'DATE',
  o: 'ASC',
  l: 'TABLE',
}

export function getDefaultJournalSliceSearchParams(now: dayjs.Dayjs = dayjs()): JournalSliceSearchParams {
  return {
    v: DateViewVariant.MONTHLY,
    y: String(now.year()),
    m: String(now.month() + 1),
    d: String(now.date()),
    g: 'DATE',
    s: 'DATE',
    o: 'ASC',
    l: 'TABLE',
  }
}

function createDefaultJournalSliceContextValue(): JournalSliceContextValue {
  return {
    get slice(): JournalSlice {
      return journalSliceFromSearchParams(getDefaultJournalSliceSearchParams())
    },
    get searchParams(): JournalSliceSearchParams {
      return getDefaultJournalSliceSearchParams()
    },
    get startDate(): dayjs.Dayjs {
      return getStartDateFromDateView(journalSliceFromSearchParams(getDefaultJournalSliceSearchParams()).timeframe)
    },
    setTimeframe: () => { },
    setGroupBy: () => { },
    setSortBy: () => { },
    setSortOrder: () => { },
    setLayout: () => { },
    setSearchParams: () => { },
    changeDateView: () => { },
    changeStartDate: () => { },
  }
}

function isDefault<K extends keyof JournalSliceSearchParams>(
  key: K,
  value: JournalSliceSearchParams[K],
): boolean {
  const def = JOURNAL_SLICE_DEFAULT_SEARCH_PARAMS[key]
  return value === def
}

export function journalSliceParamsToUrlSearch(
  params: JournalSliceSearchParams,
  now: dayjs.Dayjs = dayjs(),
): Partial<JournalSliceSearchParams> {
  const out: Partial<JournalSliceSearchParams> = {}
  if (!isDefault('v', params.v)) out.v = params.v
  const yNum = params.y != null ? Number(params.y) : null
  const mNum = params.m != null ? Number(params.m) : null
  const dNum = params.d != null ? Number(params.d) : null
  const isCurrentYear = yNum === now.year()
  const isCurrentMonth = mNum === now.month() + 1
  const isCurrentDay = dNum === now.date()
  if (params.y != null && !isCurrentYear) out.y = params.y
  if (params.m != null && !isCurrentMonth) out.m = params.m
  if (params.d != null && !isCurrentDay) out.d = params.d
  return out
}

/** Parse URL search into JournalSliceSearchParams with defaults applied. */
export function urlSearchToJournalSliceParams(
  search: Record<string, unknown>,
): JournalSliceSearchParams {
  return {
    v: parseView(search.v),
    y: parseOptNum(search.y),
    m: parseOptNum(search.m),
    d: parseOptNum(search.d),
    g: parseGroupBy(search.g),
    s: parseSortBy(search.s),
    o: parseSortOrder(search.o),
    l: parseLayout(search.l),
  }
}

function parseOptNum(v: unknown): string | undefined {
  if (v == null || v === '') return undefined
  const n = Number(v)
  return Number.isNaN(n) ? undefined : String(n)
}

function parseView(v: unknown): DateViewVariant {
  if (typeof v !== 'string') return DateViewVariant.MONTHLY
  const found = Object.values(DateViewVariant).find((x) => x === v.toLowerCase())
  return found ?? DateViewVariant.MONTHLY
}

function parseGroupBy(_v: unknown): 'DATE' {
  return 'DATE'
}

function parseSortBy(v: unknown): 'DATE' | 'MEMO' | 'AMOUNT' {
  if (v === 'MEMO' || v === 'AMOUNT') return v
  return 'DATE'
}

function parseSortOrder(v: unknown): 'ASC' | 'DESC' {
  if (v === 'DESC') return 'DESC'
  return 'ASC'
}

function parseLayout(v: unknown): 'TABLE' | 'LIST' {
  if (v === 'LIST') return 'LIST'
  return 'TABLE'
}

export function dateViewFromSearchParams(
  params: Pick<JournalSliceSearchParams, 'v' | 'y' | 'm' | 'd'>,
): DateView {
  const view = params.v
  const now = dayjs()

  if (view === DateViewVariant.CUSTOM) {
    throw new Error('Custom date view not implemented')
  }

  switch (view) {
    case DateViewVariant.ANNUAL:
      return {
        view: DateViewVariant.ANNUAL,
        year: Number(params.y ?? now.year()),
      }
    case DateViewVariant.FISCAL:
    case DateViewVariant.WEEKLY:
    case DateViewVariant.DAILY:
      return {
        view,
        year: Number(params.y ?? now.year()),
        month: Number(params.m ?? now.month() + 1),
        day: Number(params.d ?? now.date()),
      }
    case DateViewVariant.MONTHLY:
    default:
      return {
        view: DateViewVariant.MONTHLY,
        year: Number(params.y ?? now.year()),
        month: Number(params.m ?? now.month() + 1),
      }
  }
}

/** Build JournalSlice from validated URL search params. */
export function journalSliceFromSearchParams(params: JournalSliceSearchParams): JournalSlice {
  const timeframe = dateViewFromSearchParams(params)
  return {
    timeframe,
    groupBy: params.g,
    refinements: null,
    sortBy: params.s,
    sortOrder: params.o,
    layout: params.l,
  }
}

export interface JournalSliceContextValue {
  slice: JournalSlice
  searchParams: JournalSliceSearchParams
  setTimeframe: (view: DateViewVariant, y?: number, m?: number, d?: number) => void
  setGroupBy: (groupBy: JournalSliceSearchParams['g']) => void
  setSortBy: (sortBy: JournalSliceSearchParams['s']) => void
  setSortOrder: (sortOrder: JournalSliceSearchParams['o']) => void
  setLayout: (layout: JournalSliceSearchParams['l']) => void
  setSearchParams: (params: Partial<JournalSliceSearchParams>) => void
  startDate: dayjs.Dayjs
  changeDateView: (view: DateViewVariant) => void
  changeStartDate: (date: dayjs.Dayjs | null) => void
}

export const JournalSliceContext = createContext<JournalSliceContextValue>(createDefaultJournalSliceContextValue())

export interface JournalSliceProviderProps extends PropsWithChildren {
  searchParams: JournalSliceSearchParams
  setSearchParams: (params: Partial<JournalSliceSearchParams> | ((prev: JournalSliceSearchParams) => JournalSliceSearchParams)) => void
}

export function JournalSliceProvider(props: JournalSliceProviderProps) {
  const { searchParams, setSearchParams, children } = props

  const slice = useMemo(
    () => journalSliceFromSearchParams(searchParams),
    [searchParams],
  )

  const setTimeframe = useCallback(
    (view: DateViewVariant, y?: number, m?: number, d?: number) => {
      setSearchParams((prev) => {
        const next = { ...prev, v: view }
        if (view === DateViewVariant.ANNUAL) {
          next.y = y !== undefined ? String(y) : prev.y
          next.m = undefined
          next.d = undefined
        } else if (view === DateViewVariant.MONTHLY) {
          next.y = y !== undefined ? String(y) : prev.y
          next.m = m !== undefined ? String(m) : prev.m
          next.d = undefined
        } else {
          next.y = y !== undefined ? String(y) : prev.y
          next.m = m !== undefined ? String(m) : prev.m
          next.d = d !== undefined ? String(d) : prev.d
        }
        return next
      })
    },
    [setSearchParams],
  )

  const setGroupBy = useCallback(
    (groupBy: JournalSliceSearchParams['g']) => {
      setSearchParams((prev) => ({ ...prev, g: groupBy }))
    },
    [setSearchParams],
  )

  const setSortBy = useCallback(
    (sortBy: JournalSliceSearchParams['s']) => {
      setSearchParams((prev) => ({ ...prev, s: sortBy }))
    },
    [setSearchParams],
  )

  const setSortOrder = useCallback(
    (sortOrder: JournalSliceSearchParams['o']) => {
      setSearchParams((prev) => ({ ...prev, o: sortOrder }))
    },
    [setSearchParams],
  )

  const setLayout = useCallback(
    (layout: JournalSliceSearchParams['l']) => {
      setSearchParams((prev) => ({ ...prev, l: layout }))
    },
    [setSearchParams],
  )

  const setSearchParamsPartial = useCallback(
    (params: Partial<JournalSliceSearchParams>) => {
      setSearchParams((prev) => ({ ...prev, ...params }))
    },
    [setSearchParams],
  )

  const startDate = useMemo(() => getStartDateFromDateView(slice.timeframe), [slice.timeframe])

  const changeDateView = useCallback(
    (view: DateViewVariant) => {
      let next: Partial<JournalSliceSearchParams>
      if (view === DateViewVariant.ANNUAL) {
        next = { v: view, y: String(startDate.year()), m: undefined, d: undefined }
      } else if (view === DateViewVariant.MONTHLY) {
        next = { v: view, y: String(startDate.year()), m: String(startDate.month() + 1), d: undefined }
      } else if (view === DateViewVariant.CUSTOM) {
        return
      } else {
        next = {
          v: view,
          y: String(startDate.year()),
          m: String(startDate.month() + 1),
          d: String(startDate.date()),
        }
      }
      setSearchParams((prev) => ({ ...prev, ...next }))
    },
    [startDate, setSearchParams],
  )

  const changeStartDate = useCallback(
    (date: dayjs.Dayjs | null) => {
      const d = date ?? dayjs()
      const view = slice.timeframe.view
      if (view === DateViewVariant.ANNUAL) {
        setSearchParams((prev) => ({ ...prev, v: view, y: String(d.year()), m: undefined, d: undefined }))
      } else if (view === DateViewVariant.MONTHLY) {
        setSearchParams((prev) => ({ ...prev, v: view, y: String(d.year()), m: String(d.month() + 1), d: undefined }))
      } else if (view === DateViewVariant.CUSTOM) {
        return
      } else {
        setSearchParams((prev) => ({
          ...prev,
          v: view,
          y: String(d.year()),
          m: String(d.month() + 1),
          d: String(d.date()),
        }))
      }
    },
    [slice.timeframe.view, setSearchParams],
  )

  const value: JournalSliceContextValue = useMemo(
    () => ({
      slice,
      searchParams,
      startDate,
      setTimeframe,
      setGroupBy,
      setSortBy,
      setSortOrder,
      setLayout,
      setSearchParams: setSearchParamsPartial,
      changeDateView,
      changeStartDate,
    }),
    [
      slice,
      searchParams,
      startDate,
      setTimeframe,
      setGroupBy,
      setSortBy,
      setSortOrder,
      setLayout,
      setSearchParamsPartial,
      changeDateView,
      changeStartDate,
    ],
  )

  return (
    <JournalSliceContext.Provider value={value}>
      {children}
    </JournalSliceContext.Provider>
  )
}

export function useJournalSlice(): JournalSliceContextValue {
  return useContext(JournalSliceContext)
}
