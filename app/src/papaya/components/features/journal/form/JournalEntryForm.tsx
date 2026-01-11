import { JournalForm } from '@/schema/form/journal'
import { Box } from '@mui/material'
import { useFormContext, useWatch } from 'react-hook-form'
import JournalFormBaseForm from './JournalFormBaseForm'

export default function JournalEntryForm() {
  const { control } = useFormContext<JournalForm>()
  const children = useWatch({ control, name: 'childEntries' }) ?? []


  return (
    <Box sx={{ flex: 1 }}>
      <JournalFormBaseForm
        variant="base"
        descendants={
          <>
            {children.map((_child, index) => {
              return (
                <JournalFormBaseForm key={index} variant="child" childIndex={index} />
              )
            })}
          </>
        }
      />

    </Box>
  )
}
