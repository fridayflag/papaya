import { Paper, Stack, Tab, Tabs, Typography } from '@mui/material'
import { Link, useParams } from '@tanstack/react-router'
import { ReactNode } from 'react'
import JournalSettings from './JournalSettings'
import SyncingSettings from './SyncingSettings'

export enum SettingsTab {
  SYNCING = 'syncing',
  APPEARANCE = 'appearance',
  JOURNAL = 'journal',
}

export const DEFAULT_SETTINGS_TAB = SettingsTab.SYNCING as const

const SETTINGS_TABS: Record<SettingsTab, { label: string; component: ReactNode }> = {
  syncing: {
    label: 'Syncing & Account',
    component: <SyncingSettings />,
  },
  appearance: {
    label: 'Appearance & Behavior',
    component: <Typography>Appearance Settings</Typography>,
  },
  journal: {
    label: 'Journal',
    component: <JournalSettings />,
  },
}

export default function ManageSettings() {
  const section = useParams({ strict: false }).section ?? DEFAULT_SETTINGS_TAB

  return (
    <>
      <Stack mb={4} gap={0.5}>
        <Typography variant="h4">Settings</Typography>
        <Tabs value={section} sx={{ mx: -1 }}>
          {Object.entries(SETTINGS_TABS).map(([key, tab]) => {
            const section = key as SettingsTab
            return (
              <Tab
                component={Link}
                {...({
                  to: '/settings/$section',
                  params: { section },
                } as any)}
                key={section}
                value={section}
                label={tab.label}
                sx={{
                  px: 1,
                }}
              />
            )
          })}
        </Tabs>
      </Stack>

      <Paper sx={(theme) => ({ p: 3, borderRadius: theme.spacing(1), mb: 5 })}>
        {SETTINGS_TABS[section]?.component}
      </Paper>
    </>
  )
}
