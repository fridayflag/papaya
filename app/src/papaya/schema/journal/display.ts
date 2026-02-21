import z from "zod";
import { PictogramSchema } from "./entity/pictogram";

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

export const StampVariantSchema = z.enum([
  'FLAGGED',
  'IMPORTANT',
  'NEEDS_REVIEW',
  'REVIEWED',
  'STARRED',
  'PINNED',
  'ARCHIVED',
]);
export type StampVariant = z.infer<typeof StampVariantSchema>;
