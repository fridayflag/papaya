import z from "zod";

export const CurrencyIso4217Schema = z.enum(['USD', 'CAD'])
export type CurrencyIso4217 = z.output<typeof CurrencyIso4217Schema>

export const MonetaryAmountSchema = z.object({
  currency: CurrencyIso4217Schema,
  amount: z.number(),
});

export const MonetaryEnumerationSchema = z.partialRecord(
  CurrencyIso4217Schema,
  z.number()
);
export type MonetaryEnumeration = z.infer<typeof MonetaryEnumerationSchema>;
