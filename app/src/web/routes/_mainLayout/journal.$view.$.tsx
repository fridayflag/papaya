import DisplayableJournal from '@/components/features/journal/layout/DisplayableJournal'
import { JournalSlice } from '@/schema/aggregate-schemas'
import { DateView, DateViewVariant } from '@/schema/journal/facet'
import { createFileRoute, redirect } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useMemo } from 'react'

export const Route = createFileRoute('/_mainLayout/journal/$view/$')({
  component: JournalPage,
  params: {
    parse: (urlParams) => {
      const view: DateViewVariant | undefined = Object.values(DateViewVariant).find((v: DateViewVariant) => {
        return v === urlParams.view.toLowerCase()
      })

      const catchAll = urlParams._splat ?? ''
      const [year, month, day] = catchAll.split('/').filter(Boolean) as [
        string | undefined,
        string | undefined,
        string | undefined,
      ]

      if (!view) {
        throw redirect({ to: '/journal' })
      }
      const paramValues = {
        view,
        y: year ? String(Number(year)) : undefined,
        m: month ? String(Number(month)) : undefined,
        d: day ? String(Number(day)) : undefined,
      }
      if (view === DateViewVariant.ANNUAL || view === DateViewVariant.MONTHLY) {
        delete paramValues.d
      }
      if (view === DateViewVariant.ANNUAL) {
        delete paramValues.m
      }
      return paramValues
    },
    stringify: (urlParams) => {
      const y = urlParams.y ? String(Number(urlParams.y)) : undefined
      const m = urlParams.m ? String(Number(urlParams.m)) : undefined
      const d = urlParams.d ? String(Number(urlParams.d)) : undefined
      const view = urlParams.view
      const _splat = [y, m, d].filter(Boolean).join('/')

      return { view, y, m, d, _splat }
    },
  },
  validateSearch: (search: Record<string, unknown>): { tab: 'journal' | 'transfers' } => {
    const tab = (search.tab ?? 'journal') as 'journal' | 'transfers'
    return {
      tab,
    }
  },
})

function JournalPage() {
  const urlParams = Route.useParams()


  const dateView = useMemo((): DateView => {
    const view: DateViewVariant = urlParams.view
    const now = dayjs()

    if (view === DateViewVariant.CUSTOM) {
      // TODO startDate and endDate to be pulled from query params
      throw new Error('Not implemented')
    }

    switch (view) {
      case DateViewVariant.ANNUAL:
        return {
          view: DateViewVariant.ANNUAL,
          year: Number(urlParams.y ?? now),
        }

      case DateViewVariant.FISCAL:
      case DateViewVariant.WEEKLY:
      case DateViewVariant.DAILY:
        return {
          view,
          year: Number(urlParams.y ?? now.year()),
          month: Number(urlParams.m ?? now.month() + 1),
          day: Number(urlParams.d ?? now.date()),
        }

      case DateViewVariant.MONTHLY:
      default:
        return {
          view: DateViewVariant.MONTHLY,
          year: Number(urlParams.y ?? now.year()),
          month: Number(urlParams.m ?? now.month() + 1),
        }
    }
  }, [urlParams])

  const slice: JournalSlice = {
    timeframe: dateView,
    groupBy: 'DATE',
    filters: null,
    sortBy: 'DATE',
    sortOrder: 'ASC',
    layout: 'TABLE',
  }

  return (
    <DisplayableJournal
      slice={slice}
    />
  )
}
