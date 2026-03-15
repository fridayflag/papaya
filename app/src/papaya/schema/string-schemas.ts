import z from "zod";

export const TopicSlugSchema = z.templateLiteral(['#', z.string()]);
export type TopicSlug = z.infer<typeof TopicSlugSchema>;

export const AccountSlugSchema = z.templateLiteral(['&', z.string()]);
export type AccountSlug = z.infer<typeof AccountSlugSchema>;

export const PersonSlugSchema = z.templateLiteral(['@', z.string()]);
export type PersonSlug = z.infer<typeof PersonSlugSchema>;
