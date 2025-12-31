import z from "zod";

export const DisplayableAmountPropertiesSchema = z.enum([
  'INCOME',
  'PENDING',
  'APPROXIMATION',
])

export const DisplayableAmountSchema = z.object({
  currency: z.literal('CAD'),
  value: z.number(),
  properties: z.array(DisplayableAmountPropertiesSchema),
});

export type DisplayableAmount = z.infer<typeof DisplayableAmountSchema>;
