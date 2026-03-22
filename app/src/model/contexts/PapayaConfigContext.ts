import { PapayaConfig, ServerConfig, UserSettings } from '@/schema/application/config'
import { createContext } from 'react'

export interface PapayaConfigContextValue {
  /** Server-side config from GET /api/config (e.g. syncEnabled). */
  serverConfig: ServerConfig | null
  /** User preferences from the local database. */
  papayaConfig: PapayaConfig | null
  updateSettings: (settings: UserSettings) => Promise<void>
}

export const PapayaConfigContext = createContext<PapayaConfigContextValue>({
  serverConfig: null,
  papayaConfig: null,
  updateSettings: () => Promise.resolve(),
})
