import z from "zod";
import { type PapayaResourceNameBase, makeResourceName } from "./other/PapayaResourceNameSchema";

/**
 * Creates a document schema. Documents have:
 * - _id: The Papaya Resource Name (same as prn, format: base:identifier)
 * - prn: The Papaya Resource Name (format: base:identifier)
 * - @version: Version number
 */
export const makeDocumentSchema = <K extends PapayaResourceNameBase, S extends z.ZodRawShape = z.ZodRawShape>(base: K, schema: S) => {
  const prnSchema = makeResourceName(base);
  return z.object({
    _id: prnSchema,
    prn: prnSchema,
    '@version': z.number(),
  } as const).extend(schema);
};

/**
 * Creates a resource schema. Resources have:
 * - prn: The Papaya Resource Name (format: base:identifier)
 * - @version: Version number
 */
export const makeResourceSchema = <K extends PapayaResourceNameBase, S extends z.ZodRawShape = z.ZodRawShape>(base: K, schema: S) => {
  const prnSchema = makeResourceName(base);
  return z.object({
    prn: prnSchema,
    '@version': z.number(),
  } as const).extend(schema);
};

/**
 * Creates a stem schema. Stems are resources.
 */
export const makeStemSchema = <K extends string = string, S extends z.ZodRawShape = z.ZodRawShape>(base: `papaya:stem:${K}`, schema: S) => {
  return makeResourceSchema(base, schema);
};
