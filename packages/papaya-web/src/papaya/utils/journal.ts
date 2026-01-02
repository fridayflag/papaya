import { DEFAULT_AVATAR } from '@/components/input/picker/PictogramPicker'
import { JournalEntry } from '@/schema/documents/JournalEntry'
import { Pictogram } from '@/schema/journal/entity/pictogram'
import { Figure } from '@/schema/new/legacy/Figure'

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


export const generateRandomPictogram = (): Pictogram => {
  const primaryColor = `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`
  return {
    ...DEFAULT_AVATAR,
    primaryColor,
  }
}
