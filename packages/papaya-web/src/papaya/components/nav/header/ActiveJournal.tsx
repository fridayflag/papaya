import { PLACEHOLDER_UNNAMED_JOURNAL_NAME } from '@/constants/journal'
import { JournalContext } from '@/contexts/JournalContext'
import { useJournals } from '@/hooks/queries/useJournals'
import { Journal } from '@/schema/documents/Journal'
import { useJournalSelectorStatus, useSetJournalSelectorStatus } from '@/store/app/useJournalSelectorState'
import { UnfoldMore } from '@mui/icons-material'
import { Button, ButtonProps, Tooltip, Typography } from '@mui/material'
import { useContext } from 'react'

type ActiveJournalProps = ButtonProps

export default function ActiveJournal(props: ActiveJournalProps) {
  const journalContext = useContext(JournalContext)
  const { activeJournalId } = journalContext

  const setJournalSelectorStatus = useSetJournalSelectorStatus()
  const journalSelectorStatus = useJournalSelectorStatus()

  const getJournalsQuery = useJournals()
  const journals = getJournalsQuery.data
  const activeJournal: Journal | null = activeJournalId ? (journals[activeJournalId] ?? null) : null

  let journalName = activeJournal?.journalName
  if (journalName === '') {
    journalName = PLACEHOLDER_UNNAMED_JOURNAL_NAME
  }

  return (
    <Tooltip title="Manage Journals">
      {journalSelectorStatus === 'CLOSED' && !activeJournal ? (
        <Button variant="contained" onClick={() => setJournalSelectorStatus('SELECTING')} {...props}>
          Select Journal
        </Button>
      ) : (
        <Button endIcon={<UnfoldMore />} onClick={() => setJournalSelectorStatus('SELECTING')} {...props}>
          <Typography variant="h6">{journalName}</Typography>
        </Button>
      )}
    </Tooltip>
  )
}
