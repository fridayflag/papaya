import z from "zod";

export const UserContextSchema = z.object({
  username: z.string(),
});
export type UserContext = z.infer<typeof UserContextSchema>;
