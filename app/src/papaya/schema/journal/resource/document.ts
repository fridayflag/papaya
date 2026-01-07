import { JournalSettingsSchema } from "@/schema/application/config";
import { CouchDbBaseDocumentShape } from "@/schema/application/database";
import { EntryNamespace, EntryNamespaceSchema, SubEntryNamespace, SubEntryNamespaceSchema } from "@/schema/support/namespace";
import { createPapayaDocumentSchema, PapayaDocumentSchemaTemplate, PapayaResourceSchemaTemplate, VersionTagSchema } from "@/schema/support/template";
import { EntryUrnSchema, JournalUrnSchema, SubEntryUrnSchema } from "@/schema/support/urn";
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

const SubEntrySchema = z.object({
  ...({
    urn: SubEntryUrnSchema,
    kind: SubEntryNamespaceSchema,
    '@version': VersionTagSchema,
  } as const satisfies PapayaResourceSchemaTemplate<SubEntryNamespace>),
  memo: z.string(),
  amount: FigureSchema,
  date: z.iso.date(),
  time: z.iso.time().nullish(),
  sourceAccount: AccountSlugSchema.nullish(),
  destinationAccount: AccountSlugSchema.nullish(),
  topics: z.array(TopicSlugSchema).nullish(),
  stems: z.array(StemSchema).optional(),

  get children() {
    return z.array(SubEntrySchema);
  }

} as const);

export type SubEntry = z.infer<typeof SubEntrySchema>;

export const EntrySchema = SubEntrySchema.extend({
  ...({
    _id: EntryUrnSchema,
    urn: EntryUrnSchema,
    kind: EntryNamespaceSchema,
    ...CouchDbBaseDocumentShape,
    journalId: JournalUrnSchema,
    '@version': VersionTagSchema,
  } as const satisfies PapayaDocumentSchemaTemplate<EntryNamespace>),
  children: z.array(SubEntrySchema).nullish(),
});

export type Entry = z.infer<typeof EntrySchema>;
