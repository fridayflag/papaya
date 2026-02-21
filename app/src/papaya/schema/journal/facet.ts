import z from 'zod'

export enum DateViewVariant {
  ANNUAL = 'y',
  MONTHLY = 'm',
  WEEKLY = 'w',
  DAILY = 'd',
  FISCAL = 'f',
  CUSTOM = 'r',
}

export const DailyDateViewSchema = z.object({
  view: z.literal(DateViewVariant.DAILY),
  year: z.number().min(1900).max(2999),
  month: z.number().min(1).max(12),
  day: z.number().min(1).max(31),
})
export type DailyDateView = z.output<typeof DailyDateViewSchema>

export const WeeklyDateViewSchema = DailyDateViewSchema.extend({
  view: z.literal(DateViewVariant.WEEKLY),
})
export type WeeklyDateView = z.output<typeof WeeklyDateViewSchema>

export const FiscalDateViewSchema = DailyDateViewSchema.extend({
  view: z.literal(DateViewVariant.FISCAL),
})
export type FiscalDateView = z.output<typeof FiscalDateViewSchema>

export const AnnualDateViewSchema = DailyDateViewSchema.partial().extend({
  view: z.literal(DateViewVariant.ANNUAL),
  year: DailyDateViewSchema.shape.year,
})
export type AnnualDateView = z.output<typeof AnnualDateViewSchema>

export const MonthlyDateViewSchema = AnnualDateViewSchema.extend({
  view: z.literal(DateViewVariant.MONTHLY),
  month: DailyDateViewSchema.shape.month,
})
export type MonthlyDateView = z.output<typeof MonthlyDateViewSchema>

export const CustomDateViewSchema = z.object({
  view: z.literal(DateViewVariant.CUSTOM),
  before: z.string().optional(),
  after: z.string().optional(),
})
export type CustomDateView = z.output<typeof CustomDateViewSchema>

export const DateViewSchema = z.discriminatedUnion('view', [
  AnnualDateViewSchema,
  MonthlyDateViewSchema,
  WeeklyDateViewSchema,
  DailyDateViewSchema,
  FiscalDateViewSchema,
  CustomDateViewSchema,
])
export type DateView = z.output<typeof DateViewSchema>
