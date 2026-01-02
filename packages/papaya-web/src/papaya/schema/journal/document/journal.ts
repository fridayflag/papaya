import { createDocumentSchema } from "@/schema/support/template";
import z from "zod";
import { PictogramSchema } from "../resource/display";
import { PersonSlugSchema } from "../resource/string";

export const JournalSchema = createDocumentSchema('papaya:journal', {
  name: z.string(),
  notes: z.string(),
  lastOpenedAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});
export type Journal = z.infer<typeof JournalSchema>;

export const PersonSchema = createDocumentSchema('papaya:journal:person', {
  name: z.string(),
  icon: PictogramSchema.nullish(),
  slug: PersonSlugSchema,
});
export type Person = z.infer<typeof PersonSchema>;

