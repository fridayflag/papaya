import { createPapayaEntitySchema } from '@/schema/support/template';
import z from 'zod';
import { MonetaryAmountSchema } from '../money';

export const FigureSchema = createPapayaEntitySchema('papaya:entity:figure', {
  ...MonetaryAmountSchema.shape,

  /**
   * The nominal, invoiced currency (the currency paid to the merchant).
   */
  nominal: MonetaryAmountSchema.optional(),
});

export type Figure = z.infer<typeof FigureSchema>;
