import { JournalSettingsSchema } from "@/schema/application/config";
import { CouchDbBaseDocumentShape } from "@/schema/application/database";
import { EntryNamespace, EntryNamespaceSchema } from "@/schema/support/namespace";
import { createPapayaDocumentSchema, PapayaDocumentSchemaTemplate, VersionTagSchema } from "@/schema/support/template";
import { EntryUrnSchema, JournalUrnSchema } from "@/schema/support/urn";
import z from "zod";
import { FigureSchema } from "../entity/figure";
import { PictogramSchema } from "../entity/pictogram";
import { AccountSlugSchema, PersonSlugSchema, TopicSlugSchema } from "../string";
import { StemSchema } from "./stems";

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

export const EntrySchema = z.object({
  _id: EntryUrnSchema,
  urn: EntryUrnSchema,
  kind: EntryNamespaceSchema,
  ...CouchDbBaseDocumentShape,
  journalId: JournalUrnSchema,
  '@version': VersionTagSchema,
  memo: z.string(),
  amount: FigureSchema,
  date: z.iso.date(),
  time: z.iso.time().nullish(),
  sourceAccount: AccountSlugSchema.nullish(),
  destinationAccount: AccountSlugSchema.nullish(),
  topics: z.array(TopicSlugSchema).nullish(),
  stems: z.array(StemSchema).optional(),
  parent: EntryUrnSchema.nullable(),
  children: z.array(EntryUrnSchema),
} as const satisfies PapayaDocumentSchemaTemplate<EntryNamespace>);

export type Entry = z.infer<typeof EntrySchema>;
