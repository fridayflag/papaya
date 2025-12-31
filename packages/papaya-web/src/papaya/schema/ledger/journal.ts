import z from "zod";

export const TopicSlugSchema = z.templateLiteral(['#', z.string()]);

export type TopicSlug = z.infer<typeof TopicSlugSchema>;

export const AccountSlugSchema = z.templateLiteral(['&', z.string()]);

export type AccountSlug = z.infer<typeof AccountSlugSchema>;

export const PersonSlugSchema = z.templateLiteral(['@', z.string()]);
export type PersonSlug = z.infer<typeof PersonSlugSchema>;

export const JournalSchema = makeDocumentSchema('papaya:journal', {
  name: z.string(),
  notes: z.string(),
  lastOpenedAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});
export type Journal = z.infer<typeof JournalSchema>;


export const AccountSchema = makeDocumentSchema('papaya:account', {
  name: z.string(),
  slug: AccountSlugSchema,
});
export type Account = z.infer<typeof AccountSchema>;


export const PersonSchema = makeDocumentSchema('papaya:person', {
  name: z.string(),
  slug: PersonSlugSchema,
});
export type Person = z.infer<typeof PersonSchema>;

