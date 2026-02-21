import { Journal } from '@/schema/journal/resource/documents'
import { JournalUrn } from '@/schema/support/urn'
import { UseQueryResult } from '@tanstack/react-query'
import { createContext } from 'react'

export interface JournalContext {
  activeJournalId: JournalUrn | null
  queries: {
    journal: UseQueryResult<Journal | null>
  }
  setActiveJournalId: (journalId: JournalUrn | null) => void
}

export const JournalContext = createContext<JournalContext>({} as JournalContext)
