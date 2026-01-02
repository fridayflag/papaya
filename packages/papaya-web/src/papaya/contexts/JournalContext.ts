import { JournalUrn } from '@/schema/support/urn'
import { createContext } from 'react'

export interface JournalContext {
  activeJournalId: JournalUrn | null
  setActiveJournalId: (journalId: JournalUrn | null) => void
}

export const JournalContext = createContext<JournalContext>({} as JournalContext)
