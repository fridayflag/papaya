import PapayaProviders from '@/providers'
import { QueryClient } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export const Route = createRootRoute({
  component: () => (
    <PapayaProviders queryClient={queryClient}>
      <Outlet />
    </PapayaProviders>
  ),
})
