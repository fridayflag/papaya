import z from "zod";

export const UserContextSchema = z.object({
  username: z.string(),
});
export type UserContext = z.infer<typeof UserContextSchema>;

export const DatabaseManagementStatusSchema = z.object({
  managed: z.boolean(),
  couchPerUserEnabled: z.boolean(),
});
export type DatabaseManagementStatus = z.infer<typeof DatabaseManagementStatusSchema>;
