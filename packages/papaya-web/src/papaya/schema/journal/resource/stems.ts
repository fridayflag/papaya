import z from "zod";
import { makeStemSchema } from "../schema-utils";

export const AttachmentStemSchema = makeStemSchema('papaya:stem:attachment', {
  originalFileName: z.string(),
  contentType: z.string(),
  size: z.number(),
  description: z.string(),
});
export type AttachmentStem = z.infer<typeof AttachmentStemSchema>;


const FlagTypeSchema = z.enum([
  'IMPORTANT',
  'NEEDS_REVIEW',
  'REVIEWED',
]);

export const FlagStemSchema = makeStemSchema('papaya:stem:flag', {
  flags: z.record(FlagTypeSchema, z.boolean()),
});
export type FlagStem = z.infer<typeof FlagStemSchema>;


// Define EntrySchema type separately to avoid circular dependency
type EntrySchemaType = z.ZodType<any>;

export const ForkStemSchema = makeStemSchema('papaya:stem:fork', {
  subentries: z.any(),
});
export type ForkStem = z.infer<typeof ForkStemSchema>;

import { EditableAmountSchema } from "../object/EditableAmountSchema";


export const GratuityStemSchema = makeStemSchema('papaya:stem:gratuity', {
  '@ephemeral': z.object({
    value: z.string(),
  }).partial().optional(),
  '@derived': z.object({
    amount: EditableAmountSchema,
    asPercentage: z.number(),
  }),
});
export type GratuityStem = z.infer<typeof GratuityStemSchema>;

export const NoteStemSchema = makeStemSchema('papaya:stem:note', {
  content: z.string(),
});
export type NoteStem = z.infer<typeof NoteStemSchema>;



export const ObligationStemSchema = makeStemSchema('papaya:stem:obligation', {
  variant: z.enum(['DEBT', 'PAYABLE']),
  party: PersonSlugSchema,
});
export type ObligationStem = z.infer<typeof ObligationStemSchema>;



export const RecurrenceStemSchema = makeStemSchema('papaya:stem:recurrence', {
  iCalRruleString: z.string(),
});
export type RecurrenceStem = z.infer<typeof RecurrenceStemSchema>;

import { RelationTypeSchema } from "../../relation";

export const RelationStemSchema = makeStemSchema('papaya:stem:relation', {
  relatesTo: PapayaUrn,
  relation: RelationTypeSchema,
});

export type RelationStem = z.infer<typeof RelationStemSchema>;

import { PapayaUrn } from "@/schema/support/urn";
import { PersonSlugSchema } from "../document/journal";
import { makeResourceSchema } from "../schema-utils";

export const TaskSchema = makeResourceSchema('papaya:task', {
  memo: z.string(),
  completedAt: z.iso.date().nullable(),
});

export const TaskListStemSchema = makeStemSchema('papaya:stem:tasklist', {
  tasks: z.array(TaskSchema),
});
export type TaskListStem = z.infer<typeof TaskListStemSchema>;


export const TopicStemSchema = makeStemSchema('papaya:stem:topic', {
  slug: z.templateLiteral(['#', z.string()]),
});
export type TopicStem = z.infer<typeof TopicStemSchema>;


export const PapayaStemSchema = z.union([
  AttachmentStemSchema,
  FlagStemSchema,
  ForkStemSchema,
  GratuityStemSchema,
  NoteStemSchema,
  ObligationStemSchema,
  RecurrenceStemSchema,
  RelationStemSchema,
  TaskListStemSchema,
  TopicStemSchema,
]);
export type PapayaStem = z.infer<typeof PapayaStemSchema>;
