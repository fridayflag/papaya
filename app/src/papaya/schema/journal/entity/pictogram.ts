import { createPapayaEntitySchema } from "@/schema/support/template";
import z from "zod";

export const PictogramVariantSchema = z.enum(['TEXT', 'PICTORIAL', 'IMAGE'])
export type PictogramVariant = z.output<typeof PictogramVariantSchema>

export const PictogramSchema = createPapayaEntitySchema('papaya:entity:pictogram', {
  content: z.string(),
  variant: PictogramVariantSchema,
  primaryColor: z.string(),
  secondaryColor: z.string().optional().nullable(),
});

export type Pictogram = z.infer<typeof PictogramSchema>
