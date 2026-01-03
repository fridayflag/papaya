import { JournalContext } from "@/contexts/JournalContext";
import { PapayaConfigContext } from "@/contexts/PapayaConfigContext";
import { getJournalAggregate, getLastOpenedJournal } from "@/database/queries";
import SessionCache from "@/database/SessionCache";
import { JournalAggregate } from "@/schema/journal/aggregate";
import { JournalUrn } from "@/schema/support/urn";
import { useQuery } from "@tanstack/react-query";
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

  const aggregation = useQuery<JournalAggregate | undefined>({
    queryKey: ['journal', 'aggregate', activeJournalId],
    queryFn: async () => {
      return getJournalAggregate(activeJournalId)
    },
    initialData: undefined,
  });

  return (
    <JournalContext.Provider
      value={{
        activeJournalId,
        aggregation: aggregation,
        setActiveJournalId: handleSetActiveJournalId,
      }}
    >
      {props.children}
    </JournalContext.Provider>
  )
}
