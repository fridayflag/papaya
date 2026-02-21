import { JournalSettingsSchema } from "@/schema/application/config";
import { createPapayaDocumentSchema } from "@/schema/support/template";
import { TransactionUrnSchema } from "@/schema/support/urn";
import z from "zod";
import { PictogramSchema } from "../entity/pictogram";
import { PersonSlugSchema } from "../string";
import { TransactionSchema } from "./transaction";

export const JournalSchema = createPapayaDocumentSchema('papaya:document:journal', {
  name: z.string(),
  notes: z.string(),
  lastOpenedAt: z.iso.datetime().nullable(),
  settings: JournalSettingsSchema,
  createdAt: z.iso.datetime(),
});
export type Journal = z.infer<typeof JournalSchema>;

export const PersonSchema = createPapayaDocumentSchema('papaya:document:person', {
  name: z.string(),
  icon: PictogramSchema.nullish(),
  slug: PersonSlugSchema,
});
export type Person = z.infer<typeof PersonSchema>;

export const EntrySchema = createPapayaDocumentSchema('papaya:document:entry', {
  transactions: z.record(TransactionUrnSchema, TransactionSchema),
});
export type Entry = z.infer<typeof EntrySchema>;
