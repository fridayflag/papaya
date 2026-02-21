import { DEFAULT_SETTINGS_TAB } from '@/components/settings/ManageSettings'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_mainLayout/settings/')({
  loader: () => {
    throw redirect({
      to: '/settings/$section',
      params: {
        section: DEFAULT_SETTINGS_TAB,
      },
    })
  },
})
