import z from "zod";

import { PAPAYA_ENTITY_NAMESPACE } from "@/constants/resource";

type Join<K, P> =
  K extends string
  ? P extends string
  ? `${K}:${P}`
  : K
  : never;

type Namespaced<
  T,
  Prefix extends string | null = null
> = {
  [K in keyof T]:
  T[K] extends Record<string, any>
  ? keyof T[K] extends never
  ? Prefix extends string
  ? Join<Prefix, K & string>
  : K & string
  : Namespaced<
    T[K],
    Prefix extends string
    ? Join<Prefix, K & string>
    : K & string
  >
  : never;
}[keyof T];

type _PapayaEntityNamespace = Namespaced<typeof PAPAYA_ENTITY_NAMESPACE>;
type _PapayaResourceNamespace =
  | Namespaced<typeof PAPAYA_ENTITY_NAMESPACE['papaya']['resource'], 'papaya:resource'>
  | Namespaced<typeof PAPAYA_ENTITY_NAMESPACE['papaya']['document'], 'papaya:document'>

type _StemNamespace = Namespaced<typeof PAPAYA_ENTITY_NAMESPACE['papaya']['resource']['stem'], 'papaya:resource:stem'>;

// Entity Namespaces
export const JournalAggregateNamespaceSchema = z.literal('papaya:entity:journalaggregate');
export type JournalAggregateNamespace = z.infer<typeof JournalAggregateNamespaceSchema>;

export const PictogramNamespaceSchema = z.literal('papaya:entity:pictogram');
export type PictogramNamespace = z.infer<typeof PictogramNamespaceSchema>;

export const UserSettingsNamespaceSchema = z.literal('papaya:entity:usersettings');
export type UserSettingsNamespace = z.infer<typeof UserSettingsNamespaceSchema>;

export const FigureNamespaceSchema = z.literal('papaya:entity:figure');
export type FigureNamespace = z.infer<typeof FigureNamespaceSchema>;

// Resource Namespaces
export const TaskNamespaceSchema = z.literal('papaya:resource:task');
export type TaskNamespace = z.infer<typeof TaskNamespaceSchema>;

export const SubEntryNamespaceSchema = z.literal('papaya:resource:subentry');
export type SubEntryNamespace = z.infer<typeof SubEntryNamespaceSchema>;

export const RelationNamespaceSchema = z.literal('papaya:resource:stem:relation');
export type RelationNamespace = z.infer<typeof RelationNamespaceSchema>;

export const AttachmentStemNamespaceSchema = z.literal('papaya:resource:stem:attachment');
export type AttachmentStemNamespace = z.infer<typeof AttachmentStemNamespaceSchema>;

export const StampStemNamespaceSchema = z.literal('papaya:resource:stem:stamp');
export type StampStemNamespace = z.infer<typeof StampStemNamespaceSchema>;

export const GratuityStemNamespaceSchema = z.literal('papaya:resource:stem:gratuity');
export type GratuityStemNamespace = z.infer<typeof GratuityStemNamespaceSchema>;

export const NoteStemNamespaceSchema = z.literal('papaya:resource:stem:note');
export type NoteStemNamespace = z.infer<typeof NoteStemNamespaceSchema>;

export const ObligationStemNamespaceSchema = z.literal('papaya:resource:stem:obligation');
export type ObligationStemNamespace = z.infer<typeof ObligationStemNamespaceSchema>;

export const RecurrenceStemNamespaceSchema = z.literal('papaya:resource:stem:recurrence');
export type RecurrenceStemNamespace = z.infer<typeof RecurrenceStemNamespaceSchema>;

export const TaskListStemNamespaceSchema = z.literal('papaya:resource:stem:tasklist');
export type TaskListStemNamespace = z.infer<typeof TaskListStemNamespaceSchema>;

// Document Namespaces
export const JournalNamespaceSchema = z.literal('papaya:document:journal');
export type JournalNamespace = z.infer<typeof JournalNamespaceSchema>;

export const PersonNamespaceSchema = z.literal('papaya:document:person');
export type PersonNamespace = z.infer<typeof PersonNamespaceSchema>;

export const EntryNamespaceSchema = z.literal('papaya:document:entry');
export type EntryNamespace = z.infer<typeof EntryNamespaceSchema>;

const PapayaResourceNamespaceShape = {
  'papaya:resource:task': TaskNamespaceSchema,
  'papaya:resource:subentry': SubEntryNamespaceSchema,
  'papaya:resource:stem:relation': RelationNamespaceSchema,
  'papaya:resource:stem:attachment': AttachmentStemNamespaceSchema,
  'papaya:resource:stem:stamp': StampStemNamespaceSchema,
  'papaya:resource:stem:gratuity': GratuityStemNamespaceSchema,
  'papaya:resource:stem:note': NoteStemNamespaceSchema,
  'papaya:resource:stem:obligation': ObligationStemNamespaceSchema,
  'papaya:resource:stem:recurrence': RecurrenceStemNamespaceSchema,
  'papaya:resource:stem:tasklist': TaskListStemNamespaceSchema,
  'papaya:document:journal': JournalNamespaceSchema,
  'papaya:document:entry': EntryNamespaceSchema,
  'papaya:document:person': PersonNamespaceSchema,
} as const satisfies Record<_PapayaResourceNamespace, z.ZodLiteral<_PapayaResourceNamespace>>

export const PapayaResourceNamespaceSchema = z.union(Object.values(PapayaResourceNamespaceShape));

export type PapayaResourceNamespace = z.infer<typeof PapayaResourceNamespaceSchema>;

export const PapayaEntityNamespaceSchema = z.union(Object.values({
  ...PapayaResourceNamespaceShape,
  'papaya:entity:journalaggregate': JournalAggregateNamespaceSchema,
  'papaya:entity:usersettings': UserSettingsNamespaceSchema,
  'papaya:entity:pictogram': PictogramNamespaceSchema,
  'papaya:entity:figure': FigureNamespaceSchema,
} as const satisfies Record<_PapayaEntityNamespace, z.ZodLiteral<_PapayaEntityNamespace>>));
export type PapayaEntityNamespace = z.infer<typeof PapayaEntityNamespaceSchema>;

export const StemNamespaceSchema = z.union(
  Object.values(
    {
      'papaya:resource:stem:relation': RelationNamespaceSchema,
      'papaya:resource:stem:attachment': AttachmentStemNamespaceSchema,
      'papaya:resource:stem:stamp': StampStemNamespaceSchema,
      'papaya:resource:stem:gratuity': GratuityStemNamespaceSchema,
      'papaya:resource:stem:note': NoteStemNamespaceSchema,
      'papaya:resource:stem:obligation': ObligationStemNamespaceSchema,
      'papaya:resource:stem:recurrence': RecurrenceStemNamespaceSchema,
      'papaya:resource:stem:tasklist': TaskListStemNamespaceSchema,
    } as const satisfies Record<_StemNamespace, z.ZodLiteral<_StemNamespace>>
  )
) satisfies z.ZodUnion<z.ZodLiteral<_PapayaResourceNamespace>[]>
export type StemNamespace = z.infer<typeof StemNamespaceSchema>;
