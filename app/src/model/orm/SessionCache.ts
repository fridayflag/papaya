import { JournalRidSchema } from "@/model/schema/namespace-schemas";
import z from "zod";

const SessionDataSchmea = z.object({
  activeJournalRid: JournalRidSchema.nullable()
});

const SessionCacheKey = 'PAPAYA_SESSION_CACHE' as const;

export type SessionData = z.infer<typeof SessionDataSchmea>;

export default class SessionCache {
  /**
   * Gets session cache data. If the data is not found, or if the data
   * is invalid, new session cache data is generated and returned.
   */
  static get(): SessionData {
    const rawData = sessionStorage.getItem(SessionCacheKey);
    if (!rawData) {
      return SessionCache.generate();
    }
    return SessionDataSchmea.parse(JSON.parse(rawData));
  }

  /**
   * Validates, then writes session cache data to browser session storage.
   */
  static set(data: Partial<SessionData>): SessionData {
    const prev = SessionCache.get();
    return SessionCache.write({
      ...prev,
      ...data,
    });
  }

  /**
   * Generates new session cache data and writes it to browser session storage.
   */
  static generate(): SessionData {
    const data: SessionData = {
      activeJournalRid: null,
    };
    SessionCache.write(data);
    return data;
  }

  private static write(data: SessionData): SessionData {
    const validated = SessionDataSchmea.parse(data);
    sessionStorage.setItem(SessionCacheKey, JSON.stringify(validated));
    return validated;
  }
}
