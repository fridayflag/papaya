import { UserSettings } from '@/schema/models/UserSettings'
import { PapayaMeta } from '@/schema/new/legacy/PapayaMeta'
import { createContext } from 'react'

export interface PapayaContext {
  papayaMeta: PapayaMeta | null
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>
}

export const PapayaContext = createContext<PapayaContext>({
  papayaMeta: null,
  updateSettings: () => Promise.resolve(),
})
