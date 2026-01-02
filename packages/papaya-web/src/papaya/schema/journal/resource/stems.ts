import { StemNamespace } from "@/schema/support/namespace";
import { createPapayaResourceSchema } from "@/schema/support/template";
import { PapayaUrn } from "@/schema/support/urn";
import z from "zod";
import { RelationTypeSchema } from "../../relation";
import { FigureSchema } from "./money";
import { PersonSlugSchema } from "./string";
import { TaskSchema } from "./workflows";

export const AttachmentStemSchema = createPapayaResourceSchema(
  'papaya:journal:stem:attachment' satisfies `papaya:journal:stem:${string}`,
  {
    originalFileName: z.string(),
    contentType: z.string(),
    size: z.number(),
    description: z.string(),
  }
);
export type AttachmentStem = z.infer<typeof AttachmentStemSchema>;

const FlagTypeSchema = z.enum([
  'IMPORTANT',
  'NEEDS_REVIEW',
  'REVIEWED',
]);

export const FlagStemSchema = createPapayaResourceSchema(
  'papaya:journal:stem:flag' satisfies `papaya:journal:stem:${string}`,
  {
    flags: z.record(FlagTypeSchema, z.boolean()),
  }
);
export type FlagStem = z.infer<typeof FlagStemSchema>;

export const GratuityStemSchema = createPapayaResourceSchema(
  'papaya:journal:stem:gratuity' satisfies `papaya:journal:stem:${string}`,
  {
    amount: FigureSchema,
    asPercentage: z.number(),
  }
)
export type GratuityStem = z.infer<typeof GratuityStemSchema>;

export const NoteStemSchema = createPapayaResourceSchema(
  'papaya:journal:stem:note' satisfies `papaya:journal:stem:${string}`,
  {
    content: z.string(),
  }
);
export type NoteStem = z.infer<typeof NoteStemSchema>;



export const ObligationStemSchema = createPapayaResourceSchema(
  'papaya:journal:stem:obligation' satisfies `papaya:journal:stem:${string}`,
  {
    variant: z.enum(['DEBT', 'PAYABLE']),
    party: PersonSlugSchema,
  }
);
export type ObligationStem = z.infer<typeof ObligationStemSchema>;



export const RecurrenceStemSchema = createPapayaResourceSchema(
  'papaya:journal:stem:recurrence' satisfies `papaya:journal:stem:${string}`,
  {
    iCalRruleString: z.string(),
  }
);
export type RecurrenceStem = z.infer<typeof RecurrenceStemSchema>;


export const RelationStemSchema = createPapayaResourceSchema(
  'papaya:journal:stem:relation' satisfies `papaya:journal:stem:${string}`,
  {
    relatesTo: PapayaUrn,
    relation: RelationTypeSchema,
  }
);
export type RelationStem = z.infer<typeof RelationStemSchema>;

export const TaskListStemSchema = createPapayaResourceSchema(
  'papaya:journal:stem:tasklist' satisfies `papaya:journal:stem:${string}`,
  {
    tasks: z.array(TaskSchema),
  }
);
export type TaskListStem = z.infer<typeof TaskListStemSchema>;

export const StemSchema = z.union(Object.values({
  'papaya:journal:stem:attachment': AttachmentStemSchema,
  'papaya:journal:stem:flag': FlagStemSchema,
  'papaya:journal:stem:gratuity': GratuityStemSchema,
  'papaya:journal:stem:note': NoteStemSchema,
  'papaya:journal:stem:obligation': ObligationStemSchema,
  'papaya:journal:stem:recurrence': RecurrenceStemSchema,
  'papaya:journal:stem:relation': RelationStemSchema,
  'papaya:journal:stem:tasklist': TaskListStemSchema,
} as const satisfies Record<StemNamespace, z.ZodSchema<any>>));
export type Stem = z.infer<typeof StemSchema>;
