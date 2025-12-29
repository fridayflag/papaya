import z from "zod";
import { PictogramSchema } from "./PictogramSchema";

const AdornedResourceSchema = z.object({
  icon: PictogramSchema.optional(),
  label: z.string(),
})
export type AdornedResource = z.output<typeof AdornedResourceSchema>