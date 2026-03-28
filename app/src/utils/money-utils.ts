export const parseMonetaryAmountString = (amountString: string | undefined | null): number | undefined => {
  if (!amountString) {
    return undefined
  }
  const sanitizedAmount = String(amountString).replace(/[^0-9.-]/g, '')
  if (!sanitizedAmount) {
    return undefined
  }

  const parsedAmount = parseFloat(sanitizedAmount)
  if (isNaN(parsedAmount)) {
    return undefined
  }

  return amountString.startsWith('+') ? parsedAmount : -parsedAmount;
}

export const serializeJournalEntryAmount = (amount: number): string => {
  const leadingSign = amount < 0 ? '' : '+'
  return `${leadingSign}${amount.toFixed(2)}`
}
