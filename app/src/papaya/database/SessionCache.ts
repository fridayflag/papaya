import { JournalUrn } from "@/schema/support/urn";

type SessionCacheKeys = {
  ACTIVE_JOURNAL_ID: JournalUrn;
}

export default class SessionCache {
  static get<K extends keyof SessionCacheKeys>(key: K): SessionCacheKeys[K] | undefined {
    return sessionStorage.getItem(key) as SessionCacheKeys[K] | undefined;
  }

  static set<K extends keyof SessionCacheKeys>(key: K, value: SessionCacheKeys[K] | undefined | null) {
    if (value === null || value === undefined) {
      sessionStorage.removeItem(key);
      return;
    }
    return sessionStorage.setItem(key, value);
  }
}
