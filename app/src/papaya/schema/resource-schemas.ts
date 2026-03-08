import { createResourceSchema } from "@/schema/template-schemas";
import z from "zod";

export const UserSchema = createResourceSchema("papaya:user", {
  name: z.string(),
  email: z.string(),
});

export const TodoSchema = createResourceSchema("papaya:todo", {
  title: z.string(),
  description: z.string(),
});

export type User = z.infer<typeof UserSchema>;
export type Todo = z.infer<typeof TodoSchema>;
