import { createPapayaResourceSchema } from "@/schema/support/template";
import z from "zod";

export const TaskSchema = createPapayaResourceSchema('papaya:resource:task', {
  memo: z.string(),
  completedAt: z.iso.date().nullable(),
});
export type Task = z.infer<typeof TaskSchema>;
