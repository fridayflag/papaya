import { JournalContext } from "@/contexts/JournalContext";
import { PapayaConfigContext } from "@/contexts/PapayaConfigContext";
import { getLastOpenedJournal } from "@/database/actions";
import SessionCache from "@/database/SessionCache";
import { useJournal } from "@/hooks/queries";
import { JournalUrn } from "@/schema/support/urn";
import { PropsWithChildren, useContext, useEffect, useState } from "react";

export function JournalContextProvider(props: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false)
  const [activeJournalId, setActiveJournalId] = useState<JournalUrn | undefined | null>(() => {
    return SessionCache.get('ACTIVE_JOURNAL_ID');
  })

  const { papayaConfig } = useContext(PapayaConfigContext)

  useEffect(() => {
    if (initialized || !papayaConfig) {
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
          handleSetActiveJournalId(journalId)
        }
      })
      .finally(() => {
        setInitialized(true)
      })
  }, [initialized, papayaConfig]);

  const handleSetActiveJournalId = (journalId: JournalUrn | null) => {
    setActiveJournalId(journalId)
    SessionCache.set('ACTIVE_JOURNAL_ID', journalId)
  }

  return (
    <JournalContext.Provider
      value={{
        activeJournalId: activeJournalId ?? null,
        queries: {
          journal: useJournal(activeJournalId ?? null),
        },
        setActiveJournalId: handleSetActiveJournalId,
      }}
    >
      {props.children}
    </JournalContext.Provider>
  )
}
