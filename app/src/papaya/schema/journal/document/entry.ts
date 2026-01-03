import { CouchDbBaseDocumentShape } from "@/schema/application/database";
import { EntryNamespace, EntryNamespaceSchema, SubEntryNamespace, SubEntryNamespaceSchema } from "@/schema/support/namespace";
import { PapayaDocumentSchemaTemplate, PapayaResourceSchemaTemplate, VersionTagSchema } from "@/schema/support/template";
import { EntryUrnSchema, JournalUrnSchema, SubEntryUrnSchema } from "@/schema/support/urn";
import { z } from "zod";
import { StemSchema } from "../resource/stems";
import { AccountSlugSchema, TopicSlugSchema } from "../string";

const SubEntrySchema = z.object({
  ...({
    urn: SubEntryUrnSchema,
    kind: SubEntryNamespaceSchema,
    '@version': VersionTagSchema,
  } as const satisfies PapayaResourceSchemaTemplate<SubEntryNamespace>),
  memo: z.string(),
  date: z.iso.date(),
  time: z.iso.time().nullish(),
  sourceAccount: AccountSlugSchema.nullish(),
  destinationAccount: AccountSlugSchema.nullish(),
  topics: z.array(TopicSlugSchema).nullish(),
  stems: z.array(StemSchema).optional(),

  // '@metadata': z.object({
  //   isDefault: z.boolean().nullish(),
  // }).nullish(),

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
