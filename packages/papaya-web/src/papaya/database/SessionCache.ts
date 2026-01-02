import { JournalUrn } from "@/schema/support/urn";

type SessionCacheKeys = {
  ACTIVE_JOURNAL_ID: JournalUrn;
}

export default class SessionCache {
  static get<K extends keyof SessionCacheKeys>(key: K): SessionCacheKeys[K] | null {
    return sessionStorage.getItem(key) as SessionCacheKeys[K] | null;
  }

  static set<K extends keyof SessionCacheKeys>(key: K, value: SessionCacheKeys[K] | null) {
    if (value === null) {
      sessionStorage.removeItem(key);
      return;
    }
    return sessionStorage.setItem(key, value);
  }
}
