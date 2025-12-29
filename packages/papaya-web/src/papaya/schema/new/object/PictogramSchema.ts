import z from "zod"

export const PictogramVariant = z.enum(['TEXT', 'PICTORIAL', 'IMAGE'])
export type PictogramVariant = z.output<typeof PictogramVariant>

export const PictogramSchema = z.object({
  content: z.string(),
  variant: PictogramVariant,
  primaryColor: z.string(),
  secondaryColor: z.string().optional().nullable(),
})

export type Pictogram = z.output<typeof PictogramSchema>
