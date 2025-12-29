import z from "zod";

const SlugDecoratorSchema = z.enum(['&', '#'])

export const DecoratedSlugSchema = z.object({
  decorator: SlugDecoratorSchema,
  slug: z.string(),
})
export type DecoratedSlug = z.output<typeof DecoratedSlugSchema>
