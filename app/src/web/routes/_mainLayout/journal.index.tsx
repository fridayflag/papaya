import { DateViewVariant } from '@/schema/journal/facet'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_mainLayout/journal/')({
  loader: () => {
    throw redirect({
      to: '/journal/$view/$',
      params: { view: DateViewVariant.MONTHLY, d: undefined, m: undefined, y: undefined },
      search: { tab: 'journal' },
    })
  },
})
