import z from "zod";
import {
  PapayaConfigSchema,
  UserSettingsSchema,
  type PapayaConfig,
  type UserSettings,
} from "../resource-schemas";

/** Response shape from GET /api/config (server-side feature flags / config). */
export const ServerConfigSchema = z.object({
  syncEnabled: z.boolean(),
});
export type ServerConfig = z.infer<typeof ServerConfigSchema>;

export { PapayaConfigSchema, UserSettingsSchema, type PapayaConfig, type UserSettings };

