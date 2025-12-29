import z from "zod";
import { makeDocumentSchema } from "../schema-utils";

export const TopicSlugSchema = z.templateLiteral(['#', z.string()]);

export type TopicSlug = z.infer<typeof TopicSlugSchema>;

export const TopicSchema = makeDocumentSchema('papaya:topic', {
  name: z.string(),
  slug: TopicSlugSchema,
});
export type Topic = z.infer<typeof TopicSchema>;
