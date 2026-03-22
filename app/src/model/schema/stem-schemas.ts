import z from "zod";
import { PriceSchema, StampVariantSchema } from "./etc-schemas";
import { PapayaResourceRidSchema } from "./namespace-schemas";
import { RelationTypeSchema } from "./relation-schemas";
import { TaskSchema } from "./resource-schemas";
import { PersonSlugSchema } from "./string-schemas";

export const AttachmentStemSchema = z.object({
  originalFileName: z.string(),
  contentType: z.string(),
  size: z.number(),
  description: z.string(),
});

export const StampStemSchema = z.object({
  stamps: z.record(StampVariantSchema, z.boolean()),
});

export const GratuityStemSchema = z.object({
  cost: PriceSchema,
  asPercentage: z.number(),
});

export const NoteStemSchema = z.object({
  content: z.string(),
});


export const ObligationStemSchema = z.object({
  variant: z.enum(["DEBT", "PAYABLE"]),
  party: PersonSlugSchema,
});


export const RecurrenceStemSchema = z.object({
  iCalRruleString: z.string(),
});

export const RelationStemSchema = z.object({
  relatesTo: PapayaResourceRidSchema,
  relation: RelationTypeSchema,
});


export const TaskListStemSchema = z.object({
  tasks: z.array(TaskSchema),
});
