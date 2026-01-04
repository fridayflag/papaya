import { Journal } from '@/schema/journal/resource/document'
import { JournalUrn } from '@/schema/support/urn'
import { UseQueryResult } from '@tanstack/react-query'
import { createContext } from 'react'

export interface JournalContext {
  activeJournalId: JournalUrn | undefined | null
  queries: {
    journal: UseQueryResult<Journal | undefined>
  }
  setActiveJournalId: (journalId: JournalUrn | null) => void
}

export const JournalContext = createContext<JournalContext>({} as JournalContext)
