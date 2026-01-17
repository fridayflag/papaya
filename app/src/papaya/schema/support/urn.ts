import z from "zod";
import {
  AttachmentStemNamespaceSchema,
  ConfigNamespaceSchema,
  EntryNamespaceSchema,
  GratuityStemNamespaceSchema,
  JournalNamespaceSchema,
  NoteStemNamespaceSchema,
  ObligationStemNamespaceSchema,
  PapayaResourceNamespace,
  PersonNamespaceSchema,
  RecurrenceStemNamespaceSchema,
  RelationNamespaceSchema,
  StampStemNamespaceSchema,
  TaskListStemNamespaceSchema,
  TaskNamespaceSchema
} from "./namespace";

export const ConfigUrnSchema = z.templateLiteral([ConfigNamespaceSchema, ':', z.uuid()]);
export type ConfigUrn = z.infer<typeof ConfigUrnSchema>;

export const JournalUrnSchema = z.templateLiteral([JournalNamespaceSchema, ':', z.uuid()]);
export type JournalUrn = z.infer<typeof JournalUrnSchema>;

export const EntryUrnSchema = z.templateLiteral([EntryNamespaceSchema, ':', z.uuid()]);
export type EntryUrn = z.infer<typeof EntryUrnSchema>;

export const PersonUrnSchema = z.templateLiteral([PersonNamespaceSchema, ':', z.uuid()]);
export type PersonUrn = z.infer<typeof PersonUrnSchema>;

export const TaskUrnSchema = z.templateLiteral([TaskNamespaceSchema, ':', z.uuid()]);
export type TaskUrn = z.infer<typeof TaskUrnSchema>;

export const RelationUrnSchema = z.templateLiteral([RelationNamespaceSchema, ':', z.uuid()]);
export type RelationUrn = z.infer<typeof RelationUrnSchema>;

export const AttachmentStemUrnSchema = z.templateLiteral([AttachmentStemNamespaceSchema, ':', z.uuid()]);
export type AttachmentStemUrn = z.infer<typeof AttachmentStemUrnSchema>;

export const StampStemUrnSchema = z.templateLiteral([StampStemNamespaceSchema, ':', z.uuid()]);
export type StampStemUrn = z.infer<typeof StampStemUrnSchema>;

export const GratuityStemUrnSchema = z.templateLiteral([GratuityStemNamespaceSchema, ':', z.uuid()]);
export type GratuityStemUrn = z.infer<typeof GratuityStemUrnSchema>;

export const NoteStemUrnSchema = z.templateLiteral([NoteStemNamespaceSchema, ':', z.uuid()]);
export type NoteStemUrn = z.infer<typeof NoteStemUrnSchema>;

export const ObligationStemUrnSchema = z.templateLiteral([ObligationStemNamespaceSchema, ':', z.uuid()]);
export type ObligationStemUrn = z.infer<typeof ObligationStemUrnSchema>;

export const RecurrenceStemUrnSchema = z.templateLiteral([RecurrenceStemNamespaceSchema, ':', z.uuid()]);
export type RecurrenceStemUrn = z.infer<typeof RecurrenceStemUrnSchema>;

export const TaskListStemUrnSchema = z.templateLiteral([TaskListStemNamespaceSchema, ':', z.uuid()]);
export type TaskListStemUrn = z.infer<typeof TaskListStemUrnSchema>;

export const PapayaUrnSchema = z.union(Object.values({
  'papaya:resource:task': TaskUrnSchema,
  'papaya:resource:stem:relation': RelationUrnSchema,
  'papaya:resource:stem:attachment': AttachmentStemUrnSchema,
  'papaya:resource:stem:stamp': StampStemUrnSchema,
  'papaya:resource:stem:gratuity': GratuityStemUrnSchema,
  'papaya:resource:stem:note': NoteStemUrnSchema,
  'papaya:resource:stem:obligation': ObligationStemUrnSchema,
  'papaya:resource:stem:recurrence': RecurrenceStemUrnSchema,
  'papaya:resource:stem:tasklist': TaskListStemUrnSchema,
  'papaya:document:config': ConfigUrnSchema,
  'papaya:document:journal': JournalUrnSchema,
  'papaya:document:person': PersonUrnSchema,
  'papaya:document:entry': EntryUrnSchema,
} as const satisfies Record<PapayaResourceNamespace, z.ZodTemplateLiteral<`${PapayaResourceNamespace}:${string}`>>));

export type PapayaUrn = z.infer<typeof PapayaUrnSchema>;
