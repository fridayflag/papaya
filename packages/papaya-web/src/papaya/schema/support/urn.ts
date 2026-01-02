import z from "zod";
import {
  AttachmentStemNamespaceSchema,
  EntryNamespaceSchema,
  FlagStemNamespaceSchema,
  GratuityStemNamespaceSchema,
  JournalNamespaceSchema,
  NoteStemNamespaceSchema,
  ObligationStemNamespaceSchema,
  PersonNamespaceSchema,
  PictogramNamespaceSchema,
  RecurrenceStemNamespaceSchema,
  RelationNamespaceSchema,
  SubEntryNamespaceSchema,
  TaskListStemNamespaceSchema,
  TaskNamespaceSchema,
  type PapayaResourceNamespace,
} from "./namespace";


export const JournalUrn = z.templateLiteral([JournalNamespaceSchema, ':', z.uuid()]);
export const EntryUrn = z.templateLiteral([EntryNamespaceSchema, ':', z.uuid()]);
export const PictogramUrn = z.templateLiteral([PictogramNamespaceSchema, ':', z.uuid()]);
export const PersonUrn = z.templateLiteral([PersonNamespaceSchema, ':', z.uuid()]);
export const TaskUrn = z.templateLiteral([TaskNamespaceSchema, ':', z.uuid()]);
export const SubEntryUrn = z.templateLiteral([SubEntryNamespaceSchema, ':', z.uuid()]);
export const RelationUrn = z.templateLiteral([RelationNamespaceSchema, ':', z.uuid()]);
export const AttachmentStemUrn = z.templateLiteral([AttachmentStemNamespaceSchema, ':', z.uuid()]);
export const FlagStemUrn = z.templateLiteral([FlagStemNamespaceSchema, ':', z.uuid()]);
export const GratuityStemUrn = z.templateLiteral([GratuityStemNamespaceSchema, ':', z.uuid()]);
export const NoteStemUrn = z.templateLiteral([NoteStemNamespaceSchema, ':', z.uuid()]);
export const ObligationStemUrn = z.templateLiteral([ObligationStemNamespaceSchema, ':', z.uuid()]);
export const RecurrenceStemUrn = z.templateLiteral([RecurrenceStemNamespaceSchema, ':', z.uuid()]);
export const TaskListStemUrn = z.templateLiteral([TaskListStemNamespaceSchema, ':', z.uuid()]);

export const PapayaUrn = z.union(Object.values({
  'papaya:journal': JournalUrn,
  'papaya:journal:pictogram': PictogramUrn,
  'papaya:journal:entry': EntryUrn,
  'papaya:journal:entry:subentry': SubEntryUrn,
  'papaya:journal:person': PersonUrn,
  'papaya:journal:task': TaskUrn,
  'papaya:journal:stem:relation': RelationUrn,
  'papaya:journal:stem:attachment': AttachmentStemUrn,
  'papaya:journal:stem:flag': FlagStemUrn,
  'papaya:journal:stem:gratuity': GratuityStemUrn,
  'papaya:journal:stem:note': NoteStemUrn,
  'papaya:journal:stem:obligation': ObligationStemUrn,
  'papaya:journal:stem:recurrence': RecurrenceStemUrn,
  'papaya:journal:stem:tasklist': TaskListStemUrn,
} as const satisfies Record<PapayaResourceNamespace, z.ZodTemplateLiteral<`${PapayaResourceNamespace}:${string}`>>));

export type PapayaUrn = z.infer<typeof PapayaUrn>;
