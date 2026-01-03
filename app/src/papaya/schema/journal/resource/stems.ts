import { StemNamespace } from "@/schema/support/namespace";
import { createPapayaResourceSchema } from "@/schema/support/template";
import { PapayaUrnSchema } from "@/schema/support/urn";
import z from "zod";
import { RelationTypeSchema } from "../../relation";
import { StampVariantSchema } from "../display";
import { FigureSchema } from "../entity/figure";
import { PersonSlugSchema } from "../string";
import { TaskSchema } from "./workflows";

export const AttachmentStemSchema = createPapayaResourceSchema(
  'papaya:resource:stem:attachment' satisfies `papaya:resource:stem:${string}`,
  {
    originalFileName: z.string(),
    contentType: z.string(),
    size: z.number(),
    description: z.string(),
  }
);
export type AttachmentStem = z.infer<typeof AttachmentStemSchema>;

export const StampStemSchema = createPapayaResourceSchema(
  'papaya:resource:stem:stamp' satisfies `papaya:resource:stem:${string}`,
  {
    stamps: z.record(StampVariantSchema, z.boolean()),
  }
);
export type StampStem = z.infer<typeof StampStemSchema>;

export const GratuityStemSchema = createPapayaResourceSchema(
  'papaya:resource:stem:gratuity' satisfies `papaya:resource:stem:${string}`,
  {
    amount: FigureSchema,
    asPercentage: z.number(),
  }
)
export type GratuityStem = z.infer<typeof GratuityStemSchema>;

export const NoteStemSchema = createPapayaResourceSchema(
  'papaya:resource:stem:note' satisfies `papaya:resource:stem:${string}`,
  {
    content: z.string(),
  }
);
export type NoteStem = z.infer<typeof NoteStemSchema>;



export const ObligationStemSchema = createPapayaResourceSchema(
  'papaya:resource:stem:obligation' satisfies `papaya:resource:stem:${string}`,
  {
    variant: z.enum(['DEBT', 'PAYABLE']),
    party: PersonSlugSchema,
  }
);
export type ObligationStem = z.infer<typeof ObligationStemSchema>;



export const RecurrenceStemSchema = createPapayaResourceSchema(
  'papaya:resource:stem:recurrence' satisfies `papaya:resource:stem:${string}`,
  {
    iCalRruleString: z.string(),
  }
);
export type RecurrenceStem = z.infer<typeof RecurrenceStemSchema>;


export const RelationStemSchema = createPapayaResourceSchema(
  'papaya:resource:stem:relation' satisfies `papaya:resource:stem:${string}`,
  {
    relatesTo: PapayaUrnSchema,
    relation: RelationTypeSchema,
  }
);
export type RelationStem = z.infer<typeof RelationStemSchema>;

export const TaskListStemSchema = createPapayaResourceSchema(
  'papaya:resource:stem:tasklist' satisfies `papaya:resource:stem:${string}`,
  {
    tasks: z.array(TaskSchema),
  }
);
export type TaskListStem = z.infer<typeof TaskListStemSchema>;

export const StemSchema = z.union(Object.values({
  'papaya:resource:stem:attachment': AttachmentStemSchema,
  'papaya:resource:stem:stamp': StampStemSchema,
  'papaya:resource:stem:gratuity': GratuityStemSchema,
  'papaya:resource:stem:note': NoteStemSchema,
  'papaya:resource:stem:obligation': ObligationStemSchema,
  'papaya:resource:stem:recurrence': RecurrenceStemSchema,
  'papaya:resource:stem:relation': RelationStemSchema,
  'papaya:resource:stem:tasklist': TaskListStemSchema,
} as const satisfies Record<StemNamespace, z.ZodSchema<any>>));
export type Stem = z.infer<typeof StemSchema>;
