import { DEFAULT_AVATAR } from '@/components/pickers/AvatarPicker'
import { Category } from '@/schema/documents/Category'
import { CreateEntryArtifact, EntryArtifact } from '@/schema/documents/EntryArtifact'
import { CreateJournalEntry, JournalEntry } from '@/schema/documents/JournalEntry'
import { FigureEnumeration } from '@/schema/journal/resource/money'
import { StatusVariant } from '@/schema/models/EntryStatus'
import { CreateEntryTask, EntryTask } from '@/schema/models/EntryTask'
import { Avatar } from '@/schema/new/legacy/Avatar'
import { Figure } from '@/schema/new/legacy/Figure'
import { CadenceFrequency, DayOfWeek, RecurringCadence } from '@/schema/support/recurrence'
import { DateView } from '@/schema/support/search/facet'
import { PapayaDocument } from '@/schema/union/PapayaDocument'
import dayjs from 'dayjs'
import { getNthWeekdayOfMonthFromDate } from './date'
import { generateGenericPapayaUniqueId } from './id'

/**
 * Strips optional fields from a JournalEntry object
 */
export const simplifyJournalEntry = (entry: JournalEntry): JournalEntry => {
  if (!entry.tagIds?.length) {
    delete entry.tagIds
  }
  if (!entry.relatedEntryIds?.length) {
    delete entry.relatedEntryIds
  }
  if (!entry.categoryId) {
    delete entry.categoryId
  }
  if (!entry.notes) {
    delete entry.notes
  }

  return {
    ...entry,
  }
}

export const parseJournalEntryAmount = (amount: string | undefined): Figure | undefined => {
  if (!amount) {
    return undefined
  }
  const sanitizedAmount = String(amount).replace(/[^0-9.-]/g, '')
  if (!sanitizedAmount) {
    return undefined
  }

  const parsedAmount = parseFloat(sanitizedAmount)
  if (isNaN(parsedAmount)) {
    return undefined
  }

  const parsedNetAmount = amount.startsWith('+') ? parsedAmount : -parsedAmount

  return {
    kind: 'papaya:figure',
    amount: parsedNetAmount,
    currency: 'CAD',
  }
}

export const serializeJournalEntryAmount = (amount: number): string => {
  const leadingSign = amount < 0 ? '' : '+'
  return `${leadingSign}${amount.toFixed(2)}`
}

/**
 * Enumerates all Figures into a single Figure that represents the
 * total sum, grouped by currency
 */
export const calculateNetFigures = (entry: JournalEntry): FigureEnumeration => {
  const children = (entry as JournalEntry).children ?? []
  const figures: Figure[] = [entry.$derived?.figure, ...children.map((child) => child.$derived?.figure)].filter(
    (figure): figure is Figure => Boolean(figure),
  )

  return figures.reduce((acc: FigureEnumeration, figure: Figure) => {
    if (figure.currency in acc) {
      ; (acc[figure.currency] as Figure).amount += figure.amount
    } else {
      acc[figure.currency] = {
        ...figure,
        convertedFrom: undefined,
      }
    }
    return acc
  }, {})
}

export const makeJournalEntry = (formData: Partial<CreateJournalEntry>, journalId: string): JournalEntry => {
  const now = new Date().toISOString()

  const entry: JournalEntry = {
    _id: formData._id ?? generateGenericPapayaUniqueId(),
    kind: 'papaya:entry',
    createdAt: now,
    date: formData.date ?? dayjs(now).format('YYYY-MM-DD'),
    memo: formData.memo ?? '',
    journalId,
    children: [],
    $ephemeral: {
      amount: '',
    },
  }

  return entry
}

export const cementJournalEntry = (formData: JournalEntry): JournalEntry => {
  const cementedFormData: JournalEntry = {
    ...formData,
    $derived: {
      figure: parseJournalEntryAmount(formData.$ephemeral?.amount),
    },
    children: formData.children.map((child) => ({
      ...child,
      $derived: {
        figure: parseJournalEntryAmount(child.$ephemeral?.amount),
      },
    })),
  }

  const netFigure = calculateNetFigures(cementedFormData)
  if (!cementedFormData.$derived) {
    return cementedFormData
  }
  cementedFormData.$derived.net = netFigure
  return cementedFormData
}

export const makeEntryArtifact = (formData: CreateEntryArtifact, journalId: string): EntryArtifact => {
  const now = new Date().toISOString()

  const entryArtifact: EntryArtifact = {
    _id: formData._id ?? generateGenericPapayaUniqueId(),
    kind: 'papaya:artifact',
    originalFileName: formData.originalFileName ?? '',
    contentType: formData.contentType ?? '',
    size: formData.size ?? 0,
    createdAt: now,
    journalId,
  }

  return entryArtifact
}

export const makeEntryTask = (formData: Partial<CreateEntryTask>): EntryTask => {
  const newTask: EntryTask = {
    _id: formData._id ?? generateGenericPapayaUniqueId(),
    kind: 'papaya:task',
    memo: formData.memo ?? '',
    completedAt: formData.completedAt ?? null,
  }

  return newTask
}

export const journalEntryHasTasks = (entry: JournalEntry): boolean => {
  if (!entry.tasks) {
    return false
  }
  return entry.tasks.length > 0
}
export const journalEntryHasTags = (entry: JournalEntry): boolean => {
  if (!entry.tagIds) {
    return false
  }
  return entry.tagIds.length > 0
}

/**
 * @deprecated infer directly via `kind` discriminator
 */
export const documentIsJournalEntry = (doc: PapayaDocument): doc is JournalEntry => {
  return 'kind' in doc && doc.kind === 'papaya:entry'
}

/**
 * @deprecated infer directly via `kind` discriminator
 */
export const documentIsCategory = (doc: PapayaDocument): doc is Category => {
  return 'kind' in doc && doc.kind === 'papaya:category'
}

export const generateRandomAvatar = (): Avatar => {
  const primaryColor = `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`
  return {
    ...DEFAULT_AVATAR,
    primaryColor,
  }
}

export const enumerateJournalEntryStatuses = (
  entry: JournalEntry,
): { parent: Set<StatusVariant>; children: Set<StatusVariant> } => {
  return {
    parent: new Set<StatusVariant>(entry.statusIds ?? []),
    children: new Set<StatusVariant>(entry.children?.flatMap((child) => child.statusIds ?? []) ?? []),
  }
}

function* generateDatesFromRecurringCadence(startDate: dayjs.Dayjs, cadence: RecurringCadence) {
  const { frequency, interval } = cadence
  let date = startDate.clone()

  function getWeekDates(day: dayjs.Dayjs): Record<DayOfWeek, dayjs.Dayjs> {
    const weekday = day.day() // 0 (Sunday) to 6 (Saturday)
    const startOfWeek = day.subtract(weekday, 'day') // Back up to Sunday

    const result: Record<DayOfWeek, dayjs.Dayjs> = {} as Record<DayOfWeek, dayjs.Dayjs>

    Object.values(DayOfWeek.enum).forEach((label, index) => {
      result[label] = startOfWeek.add(index, 'day')
    })

    return result
  }

  switch (frequency) {
    case CadenceFrequency.enum.D:
      for (; ;) {
        date = date.add(interval, 'days')
        yield date
      }
    case CadenceFrequency.enum.Y:
      for (; ;) {
        date = date.add(interval, 'years')
        yield date
      }
    case CadenceFrequency.enum.W:
      for (; ;) {
        const weekDates = getWeekDates(date.add(interval, 'weeks'))
        for (const i in cadence.days) {
          date = weekDates[cadence.days[i]]
          yield date
        }
      }
    case CadenceFrequency.enum.M:
      if ('day' in cadence.on) {
        for (; ;) {
          date = date.startOf('month').add(interval, 'months')
          if (cadence.on.day <= date.daysInMonth()) {
            yield date.date(cadence.on.day)
          }
        }
      } else if ('week' in cadence.on) {
        const dayOfWeek = date.day() // 0 = Sunday, 1 = Monday
        let month: dayjs.Dayjs = date.clone()
        let nthWeekday: dayjs.Dayjs | undefined

        for (; ;) {
          month = month.add(interval, 'months').startOf('month')
          nthWeekday = getNthWeekdayOfMonthFromDate(month, dayOfWeek, cadence.on.week)
          if (nthWeekday) {
            date = nthWeekday
            yield date
          }
        }
      }
  }
}

export const discriminateEntryTags = (tagIds: string[]) => {
  const statuses = new Set<StatusVariant>(Object.values(StatusVariant.enum))

  return tagIds.reduce(
    (acc: { statusIds: StatusVariant[]; entryTagIds: string[] }, tagId: string) => {
      if (statuses.has(tagId as StatusVariant)) {
        acc.statusIds.push(tagId as StatusVariant)
      } else {
        acc.entryTagIds.push(tagId)
      }
      return acc
    },
    { statusIds: [], entryTagIds: [] },
  )
}

/**
 * Given a set of nonspecific entries that are known to
 */
export const getRecurrencesForDateView = (
  _recurringEntries: Record<string, JournalEntry>,
  _dateView: DateView,
): Record<string, Set<string>> => {
  return {}

  // TODO fix after ZK-132

  // const { startDate: dateViewAbsoluteStart, endDate: dateViewAbsoluteEnd } = getAbsoluteDateRangeFromDateView(dateView)

  // // Filter all entry IDs which definitely don't occur in the given date view
  // const filteredEntryIds: string[] = []
  // Object.entries(recurringEntries).forEach(([entryId, entry]) => {
  // 	if (
  // 		dateViewAbsoluteStart
  // 		&& entry.recurs?.ends
  // 		&& 'onDate' in entry.recurs.ends
  // 		&& entry.recurs.ends.onDate
  // 		&& dayjs(entry.recurs.ends.onDate).isBefore(dateViewAbsoluteStart, 'day')
  // 	) {
  // 		// Entry recurrency ends before date view begins
  // 		return
  // 	} else if (!entry.recurs?.cadence) {
  // 		return
  // 	} else if (
  // 		entry.recurs.ends
  // 		&& 'afterNumOccurrences' in entry.recurs.ends
  // 		&& entry.recurs.ends.afterNumOccurrences === 1
  // 	) {
  // 		return
  // 	}

  // 	filteredEntryIds.push(entryId)
  // })

  // const recurrenceDates: Record<string, Set<string>> = Object.fromEntries(
  // 	filteredEntryIds.map((entryId) => {
  // 		return [entryId, new Set<string>([])]
  // 	})
  // )
  // filteredEntryIds.forEach((entryId) => {
  // 	const recurrency: EntryRecurrency = recurringEntries[entryId].recurs as EntryRecurrency
  // 	const startDate = dayjs(recurringEntries[entryId].date!)
  // 	const dateGenerator = generateDatesFromRecurringCadence(startDate, recurrency.cadence)
  // 	let date: dayjs.Dayjs | void
  // 	let numRemainingOccurrences: number = Infinity
  // 	let endDate: dayjs.Dayjs | undefined = undefined
  // 	if (recurrency.ends) {
  // 		if ('afterNumOccurrences' in recurrency.ends) {
  // 			numRemainingOccurrences = recurrency.ends.afterNumOccurrences
  // 		} else if ('onDate' in recurrency.ends) {
  // 			endDate = dayjs(recurrency.ends.onDate)
  // 		}
  // 	}

  // 	do {
  // 		date = dateGenerator.next().value
  // 		numRemainingOccurrences -= 1
  // 		if (date) {
  // 			if (date.isAfter(dateViewAbsoluteEnd, 'days')) {
  // 				return
  // 			} else if (date.isBefore(dateViewAbsoluteStart, 'days')) {
  // 				continue
  // 			} else {
  // 				recurrenceDates[entryId].add(date.format('YYYY-MM-DD'))
  // 			}
  // 		}
  // 	} while (
  // 		numRemainingOccurrences > 0
  // 		&& date
  // 		&& (!endDate || date.isBefore(endDate, 'days'))
  // 		// && maxRecurrenceCount-- > 0
  // 	)
  // })
  // return recurrenceDates
}
