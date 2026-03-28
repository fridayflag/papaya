'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
// import { montserrat } from '@/fonts/montserrat'
import NotificationsProvider from '@/components/providers/NotificationsProvider';
import { PapayaContextProvider } from '@/components/providers/PapayaContextProvider';
import appTheme from '@/theme/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient()

export default function RootLayout(props: LayoutProps<'/'>) {
  return (
    <html>
      <body>
        <ThemeProvider theme={appTheme}>
          <CssBaseline />
          <main>
            <QueryClientProvider client={queryClient}>
              <PapayaContextProvider>
                <NotificationsProvider>
                  {props.children}
                </NotificationsProvider>
              </PapayaContextProvider>
            </QueryClientProvider>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
