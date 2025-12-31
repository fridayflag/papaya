import z from "zod";
import { makeDocumentSchema } from "../schema-utils";

export const JournalSchema = makeDocumentSchema('papaya:journal', {
  name: z.string(),
  notes: z.string(),
  lastOpenedAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});
export type Journal = z.infer<typeof JournalSchema>;


export const PersonSchema = makeDocumentSchema('papaya:person', {
  name: z.string(),
  handle: z.templateLiteral(['@', z.string()]),
});
export type Person = z.infer<typeof PersonSchema>;


export const TopicSlugSchema = z.templateLiteral(['#', z.string()]);

export type TopicSlug = z.infer<typeof TopicSlugSchema>;

export const TopicSchema = makeDocumentSchema('papaya:topic', {
  name: z.string(),
  slug: TopicSlugSchema,
});
export type Topic = z.infer<typeof TopicSchema>;
