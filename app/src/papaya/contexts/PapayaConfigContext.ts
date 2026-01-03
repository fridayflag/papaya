import { PapayaConfig, UserSettings } from '@/schema/application/config'
import { createContext } from 'react'

export interface PapayaConfigContext {
  papayaConfig: PapayaConfig | null
  updateSettings: (settings: UserSettings) => Promise<void>
}

export const PapayaConfigContext = createContext<PapayaConfigContext>({
  papayaConfig: null,
  updateSettings: () => Promise.resolve(),
})
