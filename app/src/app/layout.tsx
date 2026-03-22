import { CssBaseline, ThemeProvider } from '@mui/material'
// import { montserrat } from '@/fonts/montserrat'
import { JournalContextProvider } from '@/components/providers/JournalContextProvider'
import { JournalEntryEditorContextProvider } from '@/components/providers/JournalEntryEditorContextProvider'
import NotificationsProvider from '@/components/providers/NotificationsProvider'
import PapayaConfigContextProvider from '@/components/providers/PapayaConfigContextProvider'
import RemoteContextProvider from '@/components/providers/RemoteContextProvider'
import appTheme from '@/theme/theme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function RootLayout(props: LayoutProps<'/'>) {
  return (
    <html>
      <body>
        <ThemeProvider theme={appTheme}>
          <CssBaseline />
          <main>
            <QueryClientProvider client={queryClient}>
              <PapayaConfigContextProvider>
                <NotificationsProvider>
                  <JournalContextProvider>
                    <RemoteContextProvider>
                      <JournalEntryEditorContextProvider>
                        {props.children}
                      </JournalEntryEditorContextProvider>
                    </RemoteContextProvider>
                  </JournalContextProvider>
                </NotificationsProvider>
              </PapayaConfigContextProvider>
            </QueryClientProvider>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
