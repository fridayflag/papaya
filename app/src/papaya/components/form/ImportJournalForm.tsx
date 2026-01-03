import { importJournal } from '@/database/actions'
import { useFilePrompt } from '@/hooks/useFilePrompt'
import { Button } from '@mui/material'

export default function ImportJournalForm() {
  const promptForFiles = useFilePrompt()

  const handleOpen = async () => {
    const archive = (await promptForFiles(undefined, false)) as File

    await importJournal(archive)
  }

  return (
    <>
      <Button variant="contained" onClick={() => handleOpen()}>
        Import Journal
      </Button>
    </>
  )
}
