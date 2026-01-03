import Ledger from '@/components/features/ledger/layout/Ledger'
import JournalFilterContextProvider from '@/providers/JournalFilterContextProvider'
import { DateView, DateViewVariant } from '@/schema/support/search/facet'
import { createFileRoute, redirect } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useMemo } from 'react'

export const Route = createFileRoute('/_mainLayout/ledger/$view/$')({
  component: LedgerPage,
  params: {
    parse: (params) => {
      const view: DateViewVariant | undefined = Object.values(DateViewVariant).find((v: DateViewVariant) => {
        return v === params.view.toLowerCase()
      })

      const catchAll = params._splat ?? ''
      const [year, month, day] = catchAll.split('/').filter(Boolean) as [
        string | undefined,
        string | undefined,
        string | undefined,
      ]

      if (!view) {
        throw redirect({ to: '/ledger' })
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
    stringify: (params) => {
      const y = params.y ? String(Number(params.y)) : undefined
      const m = params.m ? String(Number(params.m)) : undefined
      const d = params.d ? String(Number(params.d)) : undefined
      const view = params.view
      const _splat = [y, m, d].filter(Boolean).join('/')

      return { view, y, m, d, _splat }
    },
  },
  validateSearch: (search: Record<string, unknown>): { tab: 'ledger' | 'transfers' } => {
    const tab = (search.tab ?? 'ledger') as 'ledger' | 'transfers'
    return {
      tab,
    }
  },
})

function LedgerPage() {
  const params = Route.useParams()
  const view: DateViewVariant = params.view

  const now = useMemo(() => dayjs(), [])

  const dateView = useMemo((): DateView => {
    if (view === DateViewVariant.CUSTOM) {
      // TODO startDate and endDate to be pulled from query params
      throw new Error('Not implemented')
    }

    switch (view) {
      case DateViewVariant.ANNUAL:
        return {
          view: DateViewVariant.ANNUAL,
          year: Number(params.y ?? now),
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
  }, [params])

  return (
    <JournalFilterContextProvider
      routerFilters={{
        DATE: dateView,
      }}>
      <Ledger />
    </JournalFilterContextProvider>
  )
}
