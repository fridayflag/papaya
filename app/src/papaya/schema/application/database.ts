import z from "zod";

export const CouchDbBaseDocumentShape = {
  _rev: z.string().optional(),
} as const;
export type CouchDbBaseDocumentTemplate = typeof CouchDbBaseDocumentShape;
