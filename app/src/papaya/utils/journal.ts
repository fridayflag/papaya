
import { DEFAULT_PICTOGRAM } from '@/components/input/picker/PictogramPicker'
import { Figure } from '@/schema/journal/entity/figure'
import { Pictogram } from '@/schema/journal/entity/pictogram'
import { CurrencyIso4217 } from '@/schema/journal/money'
import { makeFigure } from '@/schema/support/factory'

export const parseJournalEntryAmount = (amount: string | undefined, currency: CurrencyIso4217): Figure | undefined => {
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

  return makeFigure(parsedNetAmount, currency);
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
    ...DEFAULT_PICTOGRAM,
    primaryColor,
  }
}
