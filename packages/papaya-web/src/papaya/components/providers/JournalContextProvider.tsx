import { JournalContext } from "@/contexts/JournalContext";
import { PapayaConfigContext } from "@/contexts/PapayaConfigContext";
import { getLastOpenedJournal } from "@/database/queries";
import SessionCache from "@/database/SessionCache";
import { JournalUrn } from "@/schema/support/urn";
import { PropsWithChildren, useContext, useEffect, useState } from "react";

export function JournalContextProvider(props: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false)
  const [activeJournalId, setActiveJournalId] = useState<JournalUrn | null>(() => {
    return SessionCache.get('ACTIVE_JOURNAL_ID') ?? null;
  })

  const { papayaConfig } = useContext(PapayaConfigContext)

  useEffect(() => {
    if (initialized || !papayaConfig || activeJournalId) {
      return
    }

    const decideActiveJournalId = async () => {
      let journalId: JournalUrn | undefined;
      if (papayaConfig.userSettings.journal.journalSelection === 'DEFAULT_JOURNAL') {
        journalId = papayaConfig.userSettings.journal.defaultJournal ?? undefined
      } else if (papayaConfig.userSettings.journal.journalSelection === 'LAST_OPENED') {
        const lastOpenedJournal = await getLastOpenedJournal()
        journalId = lastOpenedJournal?._id
      }
      return journalId
    }

    // No active journal for this session
    decideActiveJournalId()
      .then((journalId) => {
        if (journalId) {
          setActiveJournalId(journalId)
        }
      })
      .finally(() => {
        setInitialized(true)
      })
  }, [initialized, activeJournalId, papayaConfig]);

  const handleSetActiveJournalId = (journalId: JournalUrn | null) => {
    setActiveJournalId(journalId)
    SessionCache.set('ACTIVE_JOURNAL_ID', journalId)
  }

  return (
    <JournalContext.Provider
      value={{
        activeJournalId,
        setActiveJournalId: handleSetActiveJournalId,
      }}
    >
      {props.children}
    </JournalContext.Provider>
  )
}
