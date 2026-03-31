import { useActiveJournal } from '@/hooks/queries'
import { UnfoldMore } from '@mui/icons-material'
import { Button, ButtonProps, Tooltip, Typography } from '@mui/material'

type ActiveJournalProps = ButtonProps

export default function ActiveJournal(props: ActiveJournalProps) {
  const activeJournalQuery = useActiveJournal()

  return (
    <Tooltip title="Manage Journals">
      {!activeJournalQuery.data ? (
        <Button variant="contained" onClick={() => { }} {...props}>
          Select Journal
        </Button>
      ) : (
        <Button endIcon={<UnfoldMore />} onClick={() => { }} {...props}>
          <Typography variant="h6">{activeJournalQuery.data?.name}</Typography>
        </Button>
      )}
    </Tooltip>
  )
}
