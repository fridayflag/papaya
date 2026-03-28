'use client';

import { JournalContext } from "@/model/contexts/JournalContext";
import { PapayaContext } from "@/model/contexts/PapayaContext";
import { journalRepository } from "@/model/orm/repositories";
import SessionCache from "@/model/orm/SessionCache";
import { JournalRid } from "@/model/schema/namespace-schemas";
import { Journal } from "@/model/schema/resource-schemas";
import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren, use, useEffect, useState } from "react";

export function JournalContextProvider(props: PropsWithChildren) {
  const [activeJournalRid, setActiveJournalRid] = useState<JournalRid | undefined>(() => {
    return SessionCache.get().activeJournalRid ?? undefined;
  })

  const { preferences } = use(PapayaContext)

  useEffect(() => {
    if (activeJournalRid) {
      return;
    }

    const { defaultJournalRid } = preferences.journal.defaults;

    if (defaultJournalRid) {
      setActiveJournalRid(defaultJournalRid);
    }
  }, []);

  const activeJournalQuery = useQuery<Journal | undefined>({
    queryKey: ['journal', activeJournalRid],
    queryFn: async () => {
      if (!activeJournalRid) {
        return undefined;
      }
      return journalRepository.getJournalByRid(activeJournalRid);
    },
    initialData: undefined,
    enabled: !!activeJournalRid,
  });

  return (
    <JournalContext.Provider
      value={{
        activeJournal: activeJournalQuery.data,
        setActiveJournalRid,
      }}
    >
      {props.children}
    </JournalContext.Provider>
  )
}
