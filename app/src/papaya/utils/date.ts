import { DisplayableJournalEntry } from '@/schema/journal/aggregate'
import {
  AnnualDateView,
  DateView,
  DateViewVariant,
  MonthlyDateView,
  WeeklyDateView,
} from '@/schema/journal/facet'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

dayjs.extend(relativeTime)
dayjs.extend(utc)

export const getRelativeTime = (timestamp: string | null): string => {
  return dayjs.utc(timestamp).fromNow()
}

export const formatJournalEntryDate = (date: string | undefined): string => {
  const day = dayjs(date)
  const now = dayjs()

  // show year if older than 11 months ago
  const showYear = now.diff(day, 'month') > 11
  return day.format(showYear ? 'ddd MMM D, YYYY' : 'ddd MMM D')
}

export const sortDatesChronologically = (...dates: string[]) => {
  return dates.sort((a, b) => (dayjs(a).isBefore(b) ? -1 : 1))
}

export const getWeeklyDateViewFromDate = (date: dayjs.Dayjs): WeeklyDateView => {
  return {
    view: DateViewVariant.WEEKLY,
    year: date.year(),
    month: date.month() + 1, // Zero-indexed
    day: date.date(),
  }
}

export const getMonthlyDateViewFromDate = (date: dayjs.Dayjs): MonthlyDateView => {
  return {
    view: DateViewVariant.MONTHLY,
    year: date.year(),
    month: date.month() + 1, // Zero-indexed
  }
}

export const getAnnualDateViewFromDate = (date: dayjs.Dayjs): AnnualDateView => {
  return {
    view: DateViewVariant.ANNUAL,
    year: date.year(),
  }
}

export const getAbsoluteDateRangeFromDateView = (dateView: DateView) => {
  let startDate: dayjs.Dayjs | undefined = undefined
  let endDate: dayjs.Dayjs | undefined = undefined

  if (dateView.view === DateViewVariant.CUSTOM) {
    endDate = dateView.before ? dayjs(dateView.before).subtract(1, 'day') : undefined
    startDate = dateView.after ? dayjs(dateView.after).add(1, 'day') : undefined
  } else if (dateView.view === DateViewVariant.WEEKLY) {
    startDate = dayjs()
      .year(dateView.year)
      .month(dateView.month - 1)
      .date(dateView.day)

    endDate = startDate.endOf('week')
  } else if (dateView.view === DateViewVariant.MONTHLY) {
    startDate = dayjs()
      .year(dateView.year)
      .month(dateView.month - 1)
      .date(1)

    endDate = startDate.endOf('month')
  } else if (dateView.view === DateViewVariant.ANNUAL) {
    startDate = dayjs(`${dateView.year}-01-01`)
    endDate = dayjs(`${dateView.year}-12-31`)
  }

  return { startDate, endDate }
}

export const getEmpiracleDateRangeFromJournalEntries = (entries: DisplayableJournalEntry[]) => {
  const dates = entries.map((entry) => entry.date)
    .filter((date): date is string => Boolean(date));

  const sortedDates = sortDatesChronologically(...dates);
  if (sortedDates.length <= 0) {
    return { startDate: undefined, endDate: undefined }
  }

  return { startDate: dayjs(sortedDates[0]), endDate: dayjs(sortedDates[sortedDates.length - 1]) }
}
