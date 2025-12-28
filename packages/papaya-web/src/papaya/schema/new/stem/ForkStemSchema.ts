import z from "zod";
import { makeStemSchema } from "../schema-utils";

// Define EntrySchema type separately to avoid circular dependency
type EntrySchemaType = z.ZodType<any>;

export const ForkStemSchema = makeStemSchema('papaya:stem:fork', {
  subentries: z.any(),
});
export type ForkStem = z.infer<typeof ForkStemSchema>;