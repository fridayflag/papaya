import z from 'zod'
import { Figure } from '../new/legacy/Figure'
import { Currency } from './currency'

export const FigureEnumeration = z.partialRecord(Currency, Figure)
export type FigureEnumeration = z.output<typeof FigureEnumeration>
