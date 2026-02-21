import z from "zod";
import { CouchDbBaseDocumentShape, CouchDbBaseDocumentTemplate } from "../application/database";
import { PapayaEntityNamespace } from "./namespace";
import { JournalUrn, JournalUrnSchema, PapayaUrn } from "./urn";

export type PapayaVersionedResourceSchemaTemplate = {
  '@version': z.ZodTemplateLiteral<`papaya:versiontag:${number}`>;
}

export type PapayaEntitySchemaTemplate<N extends PapayaEntityNamespace> = {
  kind: z.ZodLiteral<N>;
}

export type PapayaResourceSchemaTemplate<N extends PapayaEntityNamespace> = {
  urn: z.ZodTemplateLiteral<`${N}:${string}`>;
} & PapayaEntitySchemaTemplate<N> & PapayaVersionedResourceSchemaTemplate & z.ZodRawShape;

export type PapayaDocumentSchemaTemplate<N extends PapayaEntityNamespace> = {
  _id: PapayaResourceSchemaTemplate<N>['urn'];
  journalId: z.ZodTemplateLiteral<JournalUrn>;
} & PapayaResourceSchemaTemplate<N> & CouchDbBaseDocumentTemplate;

export const VersionTagSchema = z.templateLiteral(['papaya:versiontag:', z.number().int().positive()]);
export type VersionTag = z.infer<typeof VersionTagSchema>;

export const createPapayaEntitySchema = <N extends PapayaEntityNamespace, S extends z.ZodRawShape>(namespace: N, shape: S) => {
  return z.object({
    kind: z.literal(namespace),
    '@version': VersionTagSchema,
    ...shape,
  } as const satisfies PapayaEntitySchemaTemplate<N> & S);
}

export const createPapayaResourceSchema = <N extends PapayaEntityNamespace, S extends z.ZodRawShape>(namespace: N, shape: S) => {
  const entitySchema = createPapayaEntitySchema<N, S>(namespace, shape);
  return z.object({
    urn: z.templateLiteral([namespace, ':', z.uuid()]) satisfies z.ZodTemplateLiteral<PapayaUrn>,
    ...entitySchema.shape,
  } as const satisfies PapayaResourceSchemaTemplate<N> & S);
}

export const createPapayaDocumentSchema = <N extends PapayaEntityNamespace, S extends z.ZodRawShape>(namespace: N, shape: S) => {
  const resourceSchema = createPapayaResourceSchema<N, S>(namespace, shape);
  return z.object({
    get _id() {
      return this.urn
    },
    ...CouchDbBaseDocumentShape,
    journalId: JournalUrnSchema,
    ...resourceSchema.shape,
  } as const satisfies PapayaDocumentSchemaTemplate<N> & S);
};
