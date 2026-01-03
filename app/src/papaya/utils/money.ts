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
