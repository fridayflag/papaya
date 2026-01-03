import ManageAccounts from '@/components/journal/accounts/ManageAccounts'
import LayoutContainer from '@/layouts/LayoutContainer'
import { createFileRoute } from '@tanstack/react-router'

const AccountsPage = () => {
  return (
    <LayoutContainer>
      <ManageAccounts />
    </LayoutContainer>
  )
}

export const Route = createFileRoute('/_mainLayout/accounts')({
  component: AccountsPage,
})
