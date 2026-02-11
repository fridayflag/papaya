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

export const UserIdentifierSchema = z.templateLiteral(['org.couchdb.user:', z.string()]);

export type UserIdentifier = z.infer<typeof UserIdentifierSchema>;

export const UserDocumentSchema = z.object({
  _id: UserIdentifierSchema,
  name: z.string(),
  type: z.literal("user"),
  roles: z.array(z.string()).optional(),
  password: z.string().nullish(),
});
export type UserDocument = z.infer<typeof UserDocumentSchema>;
