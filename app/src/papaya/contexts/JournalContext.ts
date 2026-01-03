import { JournalAggregate } from '@/schema/journal/aggregate'
import { JournalUrn } from '@/schema/support/urn'
import { UseQueryResult } from '@tanstack/react-query'
import { createContext } from 'react'

export interface JournalContext {
  activeJournalId: JournalUrn | null
  aggregation: UseQueryResult<JournalAggregate | undefined>
  setActiveJournalId: (journalId: JournalUrn | null) => void
}

export const JournalContext = createContext<JournalContext>({} as JournalContext)
