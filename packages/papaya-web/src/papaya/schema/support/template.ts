import z from "zod";
import { PapayaResourceNamespace } from "./namespace";
import { PapayaUrn } from "./urn";

export type PapayaResourceSchemaTemplate<N extends PapayaResourceNamespace> = {
  urn: z.ZodTemplateLiteral<`${N}:${string}`>;
  '@version': z.ZodTemplateLiteral<`papaya:versiontag:${number}`>;
} & z.ZodRawShape;

export type PapayaDocumentSchemaTemplate<N extends PapayaResourceNamespace> = {
  _id: PapayaResourceSchemaTemplate<N>['urn'];
} & PapayaResourceSchemaTemplate<N>;

export const VersionTagSchema = z.templateLiteral(['papaya:versiontag:', z.number().int().positive()]);

export const createPapayaResourceSchema = <N extends PapayaResourceNamespace, S extends z.ZodRawShape>(namespace: N, shape: S) => {
  return z.object({
    urn: z.templateLiteral([namespace, ':', z.uuid()]) satisfies z.ZodTemplateLiteral<PapayaUrn>,
    '@version': VersionTagSchema,
    ...shape,
  } as const satisfies PapayaResourceSchemaTemplate<N> & S);
}

export const createDocumentSchema = <N extends PapayaResourceNamespace, S extends z.ZodRawShape>(namespace: N, shape: S) => {
  const resourceSchema = createPapayaResourceSchema<N, S>(namespace, shape);
  return createPapayaResourceSchema(namespace, shape).extend({
    get _id() {
      return this.urn
    },
    ...resourceSchema.shape,
  } as const satisfies PapayaDocumentSchemaTemplate<N> & S);
};
