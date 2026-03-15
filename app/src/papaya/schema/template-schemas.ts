
import z from "zod";
import {
  kindSchemaFromNamespace,
  PapayaResourceKind,
  PapayaResourceRid,
  ridSchemaFromNamespace,
  type PapayaResourceNamespace,
} from "./namespace-schemas";

export type ResourceBaseSchema<N extends PapayaResourceNamespace> = {
  rid: z.ZodTemplateLiteral<PapayaResourceRid<N>>;
  kind: z.ZodLiteral<PapayaResourceKind<N>>;
  updatedAt: z.ZodString;
  "@version": z.ZodNumber;
};

export type ResourceSchema<
  N extends PapayaResourceNamespace,
  S extends z.ZodRawShape = z.ZodRawShape
> = z.ZodObject<ResourceBaseSchema<N> & S>;

export const createResourceSchema = <
  N extends PapayaResourceNamespace,
  S extends z.ZodRawShape
>(
  namespace: N,
  shape: S
) => {
  return z.object({
    rid: ridSchemaFromNamespace(namespace),
    kind: kindSchemaFromNamespace(namespace),
    updatedAt: z.string(),
    "@version": z.number(),
  }).extend(shape) satisfies ResourceSchema<N, S>;
};
