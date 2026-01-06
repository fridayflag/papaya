import { JournalContext } from '@/contexts/JournalContext'
import { UnfoldMore } from '@mui/icons-material'
import { Button, ButtonProps, Tooltip, Typography } from '@mui/material'
import { useContext } from 'react'

type ActiveJournalProps = ButtonProps

export default function ActiveJournal(props: ActiveJournalProps) {
  const journalContext = useContext(JournalContext)
  const { activeJournalId } = journalContext

  const setJournalSelectorStatus = () => { } // useSetJournalSelectorStatus()
  const journalSelectorStatus = 'CLOSED' // useJournalSelectorStatus()

  // const getJournalsQuery = useJournals()
  // const journals = getJournalsQuery.data
  // const activeJournal: Journal | null = activeJournalId ? (journals[activeJournalId] ?? null) : null

  const activeJournal = null;

  let journalName = '' // activeJournal?.journalName
  if (journalName === '') {
    journalName = 'Unnamed Journal'
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
