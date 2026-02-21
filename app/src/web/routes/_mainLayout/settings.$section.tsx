import ManageSettings, { SettingsTab } from '@/components/settings/ManageSettings'
import LayoutContainer from '@/layouts/LayoutContainer'
import { Container } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'

export default function SettingsPage() {
  return (
    <LayoutContainer>
      <Container maxWidth="md" disableGutters sx={{ mx: 2 }}>
        <ManageSettings />
      </Container>
    </LayoutContainer>
  )
}

export const Route = createFileRoute('/_mainLayout/settings/$section')({
  component: SettingsPage,
  params: {
    parse: (params) => {
      const section = Object.values(SettingsTab).find((tab) => tab === params.section.toLowerCase()) as SettingsTab
      if (!section) throw Error(`"${params.section}" is not a valid section name.`)
      return { section }
    },
  },
})
