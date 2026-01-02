import { JournalContext } from "@/contexts/JournalContext";
import SessionCache from "@/database/SessionCache";
import { JournalUrn } from "@/schema/support/urn";
import { PropsWithChildren, useEffect, useState } from "react";

export function JournalContextProvider(props: PropsWithChildren) {
  // The currently active journal
  const [activeJournalId, setActiveJournalId] = useState<JournalUrn | null>(() => {
    return SessionCache.get('ACTIVE_JOURNAL_ID') ?? null;
  })

  useEffect(() => {
    if (!activeJournalId) {

    }
  }, [activeJournalId]);

  const handleSetActiveJournalId = (journalId: JournalUrn | null) => {
    setActiveJournalId(journalId)
    SessionCache.set('ACTIVE_JOURNAL_ID', journalId)
  }

  return (
    <JournalContext.Provider
      value={{
        activeJournalId,
        setActiveJournalId,
      }}
    >
      {props.children}
    </JournalContext.Provider>
  )
}
