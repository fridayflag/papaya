import z from "zod";

export type ResourceKindTemplate = `papaya:${string}`;
export type RidTemplate<K extends ResourceKindTemplate> = `${K}:${string}`;

export type ResourceSchema<K extends ResourceKindTemplate, S extends z.ZodRawShape> = z.ZodObject<{
  rid: z.ZodTemplateLiteral<RidTemplate<K>>;
  kind: z.ZodLiteral<K>;
  updatedAt: z.ZodString;
  "@version": z.ZodNumber;
} & S>;

export type ResourceSchemaTemplate = z.ZodObject<{
  rid: z.ZodTemplateLiteral<RidTemplate<ResourceKindTemplate>>;
  kind: z.ZodLiteral<ResourceKindTemplate>;
  updatedAt: z.ZodString;
  "@version": z.ZodNumber;
}>

export const createResourceSchema = <K extends ResourceKindTemplate, S extends z.ZodRawShape>(
  kind: K,
  shape: S
) => {
  return z.object({
    rid: z.templateLiteral([kind, ":", z.uuid()]) satisfies z.ZodTemplateLiteral<RidTemplate<K>>,
    kind: z.literal(kind) satisfies z.ZodLiteral<K>,
    updatedAt: z.string(),
    '@version': z.number(),
  }).extend(shape) satisfies ResourceSchema<K, S>;
}
