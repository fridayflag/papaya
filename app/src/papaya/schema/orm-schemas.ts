import { ResourceRegistry } from "@/orm/ResourceRegistry";
import z from "zod";

export const PapayaResourceSchema = z.union(Object.values(ResourceRegistry.shape));
export type PapayaResource = z.infer<typeof PapayaResourceSchema>;

const ResourceRegistrySchemas = Object.values(ResourceRegistry.shape)

export type ResourceRegistrySchemas = typeof ResourceRegistrySchemas;


// Extract all the `kind` literals from ResourceRegistry
export const PapayaResourceKindSchema = z.union(
  Object.values(ResourceRegistry.shape).map(schema => schema.shape.kind)
);
export type PapayaResourceKind = z.infer<typeof PapayaResourceKindSchema>;

// Extract all the `rid` templates from ResourceRegistry
export const PapayaResourceRidSchema = z.union(
  Object.values(ResourceRegistry.shape).map(schema => schema.shape.rid)
);
export type PapayaResourceRid = z.infer<typeof PapayaResourceRidSchema>;
