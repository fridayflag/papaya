import { z } from 'zod';

/**
 * Template type for Papaya Resource Names (PRNs)
 * PRNs follow the pattern: `papaya:{resourceType}:{identifier}`
 */
export type PapayaResourceNameTemplate = `papaya:${string}:${string}`;

/**
 * Base PRN types (without the identifier suffix)
 */
export type PapayaResourceNameBase = `papaya:${string}`;

/**
 * Creates a PRN schema that matches the pattern: `{base}:{string}`
 * e.g., makeResourceName('papaya:stem:topic') matches 'papaya:stem:topic:groceries'
 */
export const makeResourceName = <K extends PapayaResourceNameBase>(base: K) => {
  return z.templateLiteral([z.literal(base), ':', z.string()]) as z.ZodType<`${K}:${string}`>;
};

// Document PRNs
export const EntryPrnSchema = makeResourceName('papaya:entry');
export const JournalPrnSchema = makeResourceName('papaya:journal');
export const PersonPrnSchema = makeResourceName('papaya:person');
export const AccountPrnSchema = makeResourceName('papaya:account');
export const GoalPrnSchema = makeResourceName('papaya:goal');
export const TopicPrnSchema = makeResourceName('papaya:topic');

// Resource PRNs
export const TaskPrnSchema = makeResourceName('papaya:task');

// Stem PRNs
export const TopicStemPrnSchema = makeResourceName('papaya:stem:topic');
export const ForkStemPrnSchema = makeResourceName('papaya:stem:fork');
export const AttachmentStemPrnSchema = makeResourceName('papaya:stem:attachment');
export const FlagStemPrnSchema = makeResourceName('papaya:stem:flag');
export const GratuityStemPrnSchema = makeResourceName('papaya:stem:gratuity');
export const MentionStemPrnSchema = makeResourceName('papaya:stem:mention');
export const NoteStemPrnSchema = makeResourceName('papaya:stem:note');
export const ObligationStemPrnSchema = makeResourceName('papaya:stem:obligation');
export const RecurrenceStemPrnSchema = makeResourceName('papaya:stem:recurrence');
export const RelationStemPrnSchema = makeResourceName('papaya:stem:relation');
export const TaskListStemPrnSchema = makeResourceName('papaya:stem:tasklist');
export const TransferDestinationStemPrnSchema = makeResourceName('papaya:stem:transferdestination');

/**
 * Union of all Papaya Resource Names
 */
export const PrnSchema = z.union([
  // Documents
  EntryPrnSchema,
  JournalPrnSchema,
  PersonPrnSchema,
  AccountPrnSchema,
  GoalPrnSchema,
  TopicPrnSchema,
  // Resources
  TaskPrnSchema,
  // Stems
  TopicStemPrnSchema,
  ForkStemPrnSchema,
  AttachmentStemPrnSchema,
  FlagStemPrnSchema,
  GratuityStemPrnSchema,
  MentionStemPrnSchema,
  NoteStemPrnSchema,
  ObligationStemPrnSchema,
  RecurrenceStemPrnSchema,
  RelationStemPrnSchema,
  TaskListStemPrnSchema,
  TransferDestinationStemPrnSchema,
]);

export type Prn = z.infer<typeof PrnSchema>;

