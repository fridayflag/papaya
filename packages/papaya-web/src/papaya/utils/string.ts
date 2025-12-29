import { Figure } from '@/schema/new/legacy/Figure'
import { Currency } from '@/schema/support/currency'

export interface FormatCurrencyAmountOptions {
  minimumFractionDigits: number
  maximumFractionDigits: number
  currency: Currency
}

/**
 * Formats an amount string that excludes the currency symbol.
 */
const formatCurrencyAmount = (amount: number, options: Partial<FormatCurrencyAmountOptions> = {}): string => {
  const combinedOptions: FormatCurrencyAmountOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currency: 'USD',
    ...options,
  }

  // TODO should factor in combinedOptions.currency into chosing which toLocaleString params to provide.
  return amount.toLocaleString('en-US', combinedOptions)
}

type SymbolRendering = 'simplified' | 'full'

const SYMBOLS_BY_CURRENCY: Record<`${Currency}.${SymbolRendering}`, string> = {
  'CAD.full': 'C$',
  'CAD.simplified': '$',
  'USD.full': 'US$',
  'USD.simplified': '$',
}

const getSymbolFromCurrency = (currency: Currency, symbol: SymbolRendering | 'none') => {
  if (symbol === 'none') {
    return ''
  }

  return SYMBOLS_BY_CURRENCY[`${currency}.${symbol}`]
}

export interface PriceStringOptions {
  sign: 'never' | 'whenPositive' | 'always'
  symbol: SymbolRendering | 'none'
  isApproximate: boolean
  round: boolean
}

export const getFigureString = (figure: Figure | undefined, options: Partial<PriceStringOptions> = {}): string => {
  const combinedOptions: PriceStringOptions = {
    sign: 'whenPositive',
    symbol: 'full',
    isApproximate: false,
    round: false,
    ...options,
  }
  const price = figure?.amount ?? 0
  const formatOptions: Partial<FormatCurrencyAmountOptions> = combinedOptions.round
    ? {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }
    : {}
  const priceStringParts: string[] = []

  if (combinedOptions.isApproximate) {
    priceStringParts.push('~')
  }

  if (price !== 0 && combinedOptions.sign !== 'never') {
    if (combinedOptions.sign === 'whenPositive' && price > 0) {
      priceStringParts.push('+')
    } else if (combinedOptions.sign === 'always' && price < 0) {
      priceStringParts.push('-')
    }
  }

  if (figure?.currency) {
    priceStringParts.push(getSymbolFromCurrency(figure.currency, combinedOptions.symbol))
  }

  if (price === 0) {
    priceStringParts.push('0.00')
  } else {
    priceStringParts.push(formatCurrencyAmount(Math.abs(price), formatOptions))
  }

  return priceStringParts.join('')
}

export const formatBasisPointsDiff = (basisPoints: number) => {
  return `${basisPoints >= 0 ? '+' : '-'}${(basisPoints / 100).toFixed(1)}%`
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)

  let dm = 0
  if (size < 10) {
    dm = 2 // 1 significant figure
  } else if (size < 100) {
    dm = 1 // 2 significant figures
  }

  return `${parseFloat(size.toFixed(dm))} ${sizes[i]}`
}

/**
 * Pluralizes a word.
 *
 * @example p(2, 'apple'); // => 'apples'
 * @example p(null, 'orange'); // => 'oranges'
 * @example p(1, 'banana'); // => 'banana'
 * @example p(10, 'berr', 'y', 'ies'); // => 'berries'
 *
 * @param quantity The quantity used to infer plural or singular
 * @param word The word to pluralize
 * @param {[string]} singularSuffix The suffix used for a singular item
 * @param {[string]} pluralSuffix The suffix used for plural items
 * @returns
 */
export const pluralize = (quantity: number, word: string, singularSuffix = '', pluralSuffix = 's') => {
  return `${word}${Number(quantity) === 1 ? singularSuffix : pluralSuffix}`
}

export const sentenceCase = (input: string): string => {
  return `${input.charAt(0).toUpperCase()}${input.substring(1)}`
}
