import z from 'zod';

export const CurrencyIso4217Schema = z.enum(['USD', 'CAD'])
export type CurrencyIso4217 = z.output<typeof CurrencyIso4217Schema>


export const MonetaryAmountSchema = z.object({
  currency: CurrencyIso4217Schema,
  amount: z.number(),
});

export const FigureSchema = MonetaryAmountSchema.extend({
  /**
   * The nominal, invoiced currency (the currency paid to the merchant).
   */
  nominal: MonetaryAmountSchema.optional(),
});

export type Figure = z.infer<typeof FigureSchema>;
