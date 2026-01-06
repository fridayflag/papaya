import { CssBaseline, ThemeProvider } from '@mui/material'
import { PropsWithChildren } from 'react'
// import { montserrat } from '@/fonts/montserrat'
import { JournalContextProvider } from '@/components/providers/JournalContextProvider'
import NotificationsProvider from '@/components/providers/NotificationsProvider'
import PapayaConfigContextProvider from '@/components/providers/PapayaConfigContextProvider'
import RemoteContextProvider from '@/components/providers/RemoteContextProvider'
import appTheme from '@/components/theme/theme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface PapayaProviders extends PropsWithChildren {
  queryClient: QueryClient
}

export default function PapayaProviders(props: PapayaProviders) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <main>
        <QueryClientProvider client={props.queryClient}>
          <PapayaConfigContextProvider>
            <NotificationsProvider>
              <JournalContextProvider>
                <RemoteContextProvider>
                  {props.children}
                </RemoteContextProvider>
              </JournalContextProvider>
            </NotificationsProvider>
          </PapayaConfigContextProvider>
        </QueryClientProvider>
      </main>
    </ThemeProvider>
  )
}
