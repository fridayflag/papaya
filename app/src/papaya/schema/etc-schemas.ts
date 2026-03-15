import z from "zod";

export const CurrencyIso4217Schema = z.enum(['USD', 'CAD'])

export const PriceConversionSchema = z.object({
  currency: CurrencyIso4217Schema,
  amount: z.number(),
  reference: z.object({
    conversionRate: z.number(),
    convertedAt: z.iso.datetime(),
    memo: z.string(),
  }),
  get convertedFrom() {
    return PriceConversionSchema;
  }
});

export const PriceSchema = z.object({
  currency: CurrencyIso4217Schema.optional(),
  amount: z.number(),
  convertedFrom: PriceConversionSchema.nullish(),
});

export const PictogramVariantSchema = z.enum(['TEXT', 'PICTORIAL', 'IMAGE'])

export const PictogramSchema = z.object({
  content: z.string(),
  variant: PictogramVariantSchema,
  primaryColor: z.string(),
  secondaryColor: z.string().optional().nullable(),
});

export const AdornedResourceSchema = z.object({
  icon: PictogramSchema.optional(),
  label: z.string(),
})

export const SlugDecoratorSchema = z.enum(['&', '#'])

export const DecoratedSlugSchema = z.object({
  decorator: SlugDecoratorSchema,
  slug: z.string(),
})

export const StampVariantSchema = z.enum([
  'FLAGGED',
  'IMPORTANT',
  'NEEDS_REVIEW',
  'REVIEWED',
  'STARRED',
  'PINNED',
  'ARCHIVED',
]);


export type Price = z.infer<typeof PriceSchema>;
export type PriceConversion = z.infer<typeof PriceConversionSchema>;
export type PictogramVariant = z.output<typeof PictogramVariantSchema>
export type Pictogram = z.infer<typeof PictogramSchema>
export type CurrencyIso4217 = z.output<typeof CurrencyIso4217Schema>;
export type AdornedResource = z.output<typeof AdornedResourceSchema>
export type DecoratedSlug = z.output<typeof DecoratedSlugSchema>
export type StampVariant = z.output<typeof StampVariantSchema>
