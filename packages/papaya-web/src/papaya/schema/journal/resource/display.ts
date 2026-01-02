import z from "zod";

export const PictogramVariant = z.enum(['TEXT', 'PICTORIAL', 'IMAGE'])
export type PictogramVariant = z.output<typeof PictogramVariant>

export const PictogramSchema = z.object({
  content: z.string(),
  variant: PictogramVariant,
  primaryColor: z.string(),
  secondaryColor: z.string().optional().nullable(),
})

export type Pictogram = z.output<typeof PictogramSchema>

export const AdornedResourceSchema = z.object({
  icon: PictogramSchema.optional(),
  label: z.string(),
})
export type AdornedResource = z.output<typeof AdornedResourceSchema>

export const SlugDecoratorSchema = z.enum(['&', '#'])

export const DecoratedSlugSchema = z.object({
  decorator: SlugDecoratorSchema,
  slug: z.string(),
})
export type DecoratedSlug = z.output<typeof DecoratedSlugSchema>
