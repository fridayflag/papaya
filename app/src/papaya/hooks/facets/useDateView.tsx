import { JournalFilterContext } from '@/contexts/JournalFilterContext'
import { DailyDateView, DateView, DateViewVariant, SearchFacetKey } from '@/schema/support/search/facet'
import { getAnnualDateViewFromDate, getMonthlyDateViewFromDate, getWeeklyDateViewFromDate } from '@/utils/date'
import { useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useCallback, useContext, useMemo } from 'react'

interface UseDateView {
  dateView: DateView
  startDate: dayjs.Dayjs
  changeDateView: (view: DateViewVariant) => void
  changeStartDate: (startDate: dayjs.Dayjs | null) => void
}

export default function useDateView(): UseDateView {
  const now = useMemo(() => dayjs(), [])

  const defaultDateView = useMemo((): DailyDateView => {
    return {
      view: DateViewVariant.DAILY,
      year: now.year(),
      month: now.month() + 1,
      day: now.date(),
    }
  }, [])

  const navigate = useNavigate()
  const pushToRouter = useCallback(
    (dateView: DateView) => {
      if (dateView.view === DateViewVariant.CUSTOM) {
        return
      }
      const year: string | undefined = dateView.year ? String(dateView.year) : undefined
      let month: string | undefined = dateView.month ? String(dateView.month) : undefined
      let day: string | undefined = dateView.day ? String(dateView.day) : undefined

      if (dateView.view === DateViewVariant.ANNUAL) {
        month = undefined
        day = undefined
      } else if (dateView.view === DateViewVariant.MONTHLY) {
        day = undefined
      }

      navigate({
        to: '/journal/$view/$',
        params: { view: dateView.view, y: year, m: month, d: day },
        search: { tab: 'journal' },
      })
    },
    [navigate],
  )

  const journalFilterContext = useContext(JournalFilterContext)
  const dateView: DateView = journalFilterContext?.activeJournalFilters?.[SearchFacetKey.DATE] ?? defaultDateView

  const startDate = useMemo((): dayjs.Dayjs => {
    if (dateView.view === DateViewVariant.CUSTOM) {
      return dayjs(dateView.after ?? now)
    }
    let year: number | undefined = dateView.year
    let month: number | undefined = dateView.month
    let day: number | undefined = dateView.day

    if (!month) {
      month = year ? 1 : now.month() + 1 // Zero-indexed
    }
    if (!year) {
      year = now.year()
    }

    const isSameMonthAndYear = year === now.year() && month === now.month() + 1
    if (!day) {
      day = isSameMonthAndYear ? now.date() : 1
    }

    return dayjs()
      .year(year)
      .month(month - 1)
      .date(day)
  }, [dateView])

  const changeDateView = (view: DateViewVariant) => {
    let newDateView: DateView
    switch (view) {
      case DateViewVariant.ANNUAL:
        newDateView = getAnnualDateViewFromDate(startDate)
        break

      case DateViewVariant.MONTHLY:
        newDateView = getMonthlyDateViewFromDate(startDate)
        break

      case DateViewVariant.CUSTOM:
        throw new Error('Not implemented')

      case DateViewVariant.WEEKLY:
      case DateViewVariant.FISCAL:
      case DateViewVariant.DAILY:
      default:
        newDateView = {
          ...getWeeklyDateViewFromDate(startDate),
          view,
        }
        break
    }

    pushToRouter(newDateView)
  }

  const changeStartDate = (newStartDate: dayjs.Dayjs | null) => {
    const date = newStartDate ?? now
    let newDateView: DateView

    switch (dateView.view) {
      case DateViewVariant.ANNUAL:
        newDateView = {
          view: DateViewVariant.ANNUAL,
          year: date.year(),
        }
        break

      case DateViewVariant.MONTHLY:
        newDateView = {
          view: DateViewVariant.MONTHLY,
          year: date.year(),
          month: date.month() + 1,
        }
        break

      case DateViewVariant.CUSTOM:
        throw new Error('Not implemented')

      case DateViewVariant.WEEKLY:
      case DateViewVariant.FISCAL:
      case DateViewVariant.DAILY:
        newDateView = {
          view: dateView.view,
          year: date.year(),
          month: date.month() + 1,
          day: date.date(),
        }
        break
    }

    pushToRouter(newDateView)
  }

  return {
    dateView,
    startDate,
    changeDateView,
    changeStartDate,
  }
}
