import { PapayaDocumentSchemaTemplate, PapayaResourceSchemaTemplate, VersionTagSchema } from "@/schema/support/template";
import { EntryUrn, SubEntryUrn } from "@/schema/support/urn";
import { z } from "zod";
import { PapayaStemSchema } from "../resource/stems";
import { AccountSlugSchema } from "../resource/string";

const SubEntrySchema = z.object({
  ...({
    urn: SubEntryUrn,
    '@version': VersionTagSchema,
  } as const satisfies PapayaResourceSchemaTemplate<'papaya:journal:entry:subentry'>),
  memo: z.string(),
  date: z.iso.date(),
  time: z.iso.time().nullish(),
  sourceAccount: AccountSlugSchema.nullish(),
  destinationAccount: AccountSlugSchema.nullish(),
  stems: z.record(z.string(), PapayaStemSchema).optional(),
  get children() {
    return z.array(SubEntrySchema);
  }

} as const);

export type SubEntry = z.infer<typeof SubEntrySchema>;

export const EntrySchema = SubEntrySchema.extend({
  ...({
    _id: EntryUrn,
    urn: EntryUrn,
    '@version': VersionTagSchema,
  } as const satisfies PapayaDocumentSchemaTemplate<'papaya:journal:entry'>),
  children: z.array(SubEntrySchema).nullish(),
});

export type Entry = z.infer<typeof EntrySchema>;
