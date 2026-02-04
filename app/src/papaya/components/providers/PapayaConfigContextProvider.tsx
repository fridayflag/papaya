import { PapayaConfigContext } from '@/contexts/PapayaConfigContext'
import { getOrCreatePapayaConfig, updateSettings as updateSettingsAction } from '@/database/actions'
import { PapayaConfig, ServerConfig, ServerConfigSchema, UserSettings } from '@/schema/application/config'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PropsWithChildren, useCallback } from 'react'

const SERVER_CONFIG_QUERY_KEY = ['papaya:serverConfig'] as const
const LOCAL_CONFIG_QUERY_KEY = ['papaya:config'] as const

export default function PapayaConfigContextProvider(props: PropsWithChildren) {
  const queryClient = useQueryClient()

  const serverConfigQuery = useQuery<ServerConfig | null>({
    queryKey: SERVER_CONFIG_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch('/api/config')
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status}`)
      }
      const json = await response.json()
      return ServerConfigSchema.parse(json)
    },
    initialData: null,
  })

  const localConfigQuery = useQuery<PapayaConfig | null>({
    queryKey: LOCAL_CONFIG_QUERY_KEY,
    queryFn: async () => getOrCreatePapayaConfig(),
    initialData: null,
  })

  const updateSettings = useCallback(
    async (settings: UserSettings): Promise<void> => {
      await updateSettingsAction(settings)
      await queryClient.invalidateQueries({ queryKey: LOCAL_CONFIG_QUERY_KEY })
    },
    [queryClient]
  )

  const contextValue = {
    serverConfig: serverConfigQuery.data ?? null,
    papayaConfig: localConfigQuery.data ?? null,
    updateSettings,
  }

  return (
    <PapayaConfigContext.Provider value={contextValue}>
      {props.children}
    </PapayaConfigContext.Provider>
  )
}
