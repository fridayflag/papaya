import { createPapayaDocumentSchema } from "@/schema/support/template";
import z from "zod";
import { PictogramSchema } from "../entity/pictogram";
import { PersonSlugSchema } from "../string";

export const JournalSchema = createPapayaDocumentSchema('papaya:document:journal', {
  name: z.string(),
  notes: z.string(),
  lastOpenedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});
export type Journal = z.infer<typeof JournalSchema>;

export const PersonSchema = createPapayaDocumentSchema('papaya:document:person', {
  name: z.string(),
  icon: PictogramSchema.nullish(),
  slug: PersonSlugSchema,
});
export type Person = z.infer<typeof PersonSchema>;

