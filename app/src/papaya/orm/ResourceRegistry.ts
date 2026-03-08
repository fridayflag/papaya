import * as resourceSchemas from '@/schema/resource-schemas';
import { ResourceKindTemplate, ResourceSchema } from "@/schema/template-schemas";
import z from "zod";

export const ResourceRegistry = z.object({
  ...resourceSchemas
} as const satisfies Record<`${string}Schema`, ResourceSchema<ResourceKindTemplate, z.ZodRawShape>>)
