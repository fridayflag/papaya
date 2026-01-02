import z from "zod";

import { PAPAYA_RESOURCE_NAMESPACES } from "@/constants/resource";

type Join<K, P> =
  K extends string
  ? P extends string
  ? `${K}:${P}`
  : K
  : never;

type Namespaced<
  T,
  Prefix extends string | null = null
> =
  // Emit if `$` exists
  | (
    '$' extends keyof T
    ? Prefix extends string
    ? Prefix
    : never
    : never
  )

  // Emit if this is a leaf (no non-$ keys)
  | (
    Exclude<keyof T, '$'> extends never
    ? Prefix extends string
    ? Prefix
    : never
    : never
  )

  // Recurse into non-$ keys
  | {
    [K in Exclude<keyof T, '$'>]:
    T[K] extends Record<string, any>
    ? Namespaced<
      T[K],
      Prefix extends string
      ? Join<Prefix, K & string>
      : K & string
    >
    : never;
  }[Exclude<keyof T, '$'>];

type _PapayaResourceNamespace = Namespaced<typeof PAPAYA_RESOURCE_NAMESPACES>;

export const JournalNamespaceSchema = z.literal('papaya:journal');
export const EntryNamespaceSchema = z.literal('papaya:journal:entry');
export const SubEntryNamespaceSchema = z.literal('papaya:journal:entry:subentry');
export const PictogramNamespaceSchema = z.literal('papaya:journal:pictogram');
export const RelationNamespaceSchema = z.literal('papaya:journal:relation');
export const PersonNamespaceSchema = z.literal('papaya:journal:person');
export const TopicSetStemNamespaceSchema = z.literal('papaya:journal:stem:topiclist');
export const AttachmentStemNamespaceSchema = z.literal('papaya:journal:stem:attachment');
export const FlagStemNamespaceSchema = z.literal('papaya:journal:stem:flag');
export const ForkStemNamespaceSchema = z.literal('papaya:journal:stem:fork');
export const GratuityStemNamespaceSchema = z.literal('papaya:journal:stem:gratuity');
export const NoteStemNamespaceSchema = z.literal('papaya:journal:stem:note');
export const ObligationStemNamespaceSchema = z.literal('papaya:journal:stem:obligation');
export const RecurrenceStemNamespaceSchema = z.literal('papaya:journal:stem:recurrence');
export const TaskListStemNamespaceSchema = z.literal('papaya:journal:stem:tasklist');

export const PapayaResourceNamespaceSchema = z.union(Object.values({
  'papaya:journal': JournalNamespaceSchema,
  'papaya:journal:pictogram': PictogramNamespaceSchema,
  'papaya:journal:entry': EntryNamespaceSchema,
  'papaya:journal:entry:subentry': SubEntryNamespaceSchema,
  'papaya:journal:relation': RelationNamespaceSchema,
  'papaya:journal:person': PersonNamespaceSchema,
  'papaya:journal:stem:topiclist': TopicSetStemNamespaceSchema,
  'papaya:journal:stem:attachment': AttachmentStemNamespaceSchema,
  'papaya:journal:stem:flag': FlagStemNamespaceSchema,
  'papaya:journal:stem:fork': ForkStemNamespaceSchema,
  'papaya:journal:stem:gratuity': GratuityStemNamespaceSchema,
  'papaya:journal:stem:note': NoteStemNamespaceSchema,
  'papaya:journal:stem:obligation': ObligationStemNamespaceSchema,
  'papaya:journal:stem:recurrence': RecurrenceStemNamespaceSchema,
  'papaya:journal:stem:tasklist': TaskListStemNamespaceSchema,
} as const satisfies Record<_PapayaResourceNamespace, z.ZodLiteral<_PapayaResourceNamespace>>));

export type PapayaResourceNamespace = z.infer<typeof PapayaResourceNamespaceSchema>;