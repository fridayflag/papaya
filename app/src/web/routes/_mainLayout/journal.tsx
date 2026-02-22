import DisplayableJournal from '@/components/features/journal/layout/DisplayableJournal'
import {
  journalSliceParamsToUrlSearch,
  JournalSliceProvider,
  urlSearchToJournalSliceParams,
  type JournalSliceSearchParams,
} from '@/contexts/JournalSliceContext'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'

export const Route = createFileRoute('/_mainLayout/journal')({
  component: JournalPage,
  validateSearch: (search: Record<string, unknown>): JournalSliceSearchParams => {
    return urlSearchToJournalSliceParams(search)
  },
})

function JournalPage() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate()

  const setSearchParams = useCallback(
    (paramsOrUpdater:
      | Partial<JournalSliceSearchParams>
      | ((prev: JournalSliceSearchParams) => JournalSliceSearchParams)) => {
      const next =
        typeof paramsOrUpdater === 'function'
          ? paramsOrUpdater(searchParams)
          : { ...searchParams, ...paramsOrUpdater }
      navigate({
        to: '/journal',
        search: journalSliceParamsToUrlSearch(next) as JournalSliceSearchParams,
      })
    },
    [navigate, searchParams],
  )

  return (
    <JournalSliceProvider searchParams={searchParams} setSearchParams={setSearchParams}>
      <DisplayableJournal />
    </JournalSliceProvider>
  )
}
