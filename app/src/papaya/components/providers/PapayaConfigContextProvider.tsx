
import { PapayaConfigContext } from '@/contexts/PapayaConfigContext'
import { getOrCreatePapayaConfig } from '@/database/actions'
import { PapayaConfig, UserSettings } from '@/schema/application/config'
import { useQuery } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'

export default function PapayaConfigContextProvider(props: PropsWithChildren) {
  const getPapayaConfigQuery = useQuery<PapayaConfig | null>({
    queryKey: ['papaya:config'],
    queryFn: async () => {
      console.log('return getOrCreatePapayaConfig()')
      return getOrCreatePapayaConfig()
    },
    initialData: null,
  })

  console.log('getPapayaConfigQuery.data', getPapayaConfigQuery.data)

  const updateSettings = async (settings: UserSettings): Promise<void> => {
    try {
      await updateSettings(settings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  const context: PapayaConfigContext = {
    papayaConfig: getPapayaConfigQuery.data,
    updateSettings,
  }

  return <PapayaConfigContext.Provider value={context}>{props.children}</PapayaConfigContext.Provider>
}
