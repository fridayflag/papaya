import TopicField from '@/components/input/field/TopicField'
import { JournalForm } from '@/schema/form/journal'
import { DeleteOutline, LocalOffer } from '@mui/icons-material'
import { Card, Grid, IconButton, Stack, TextField } from '@mui/material'
import { ReactNode } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import AmountField from '../../../input/field/AmountField'

type JournalFormBaseFormProps = {
  descendants?: ReactNode
} & ({
  variant: 'base'
  childIndex?: never
} | {
  variant: 'child'
  childIndex: number
})

export default function JournalFormBaseForm(props: JournalFormBaseFormProps) {
  const { descendants, variant, childIndex } = props

  const { control } = useFormContext<JournalForm>()

  const isBase = variant === 'base'

  return (
    <Stack gap={2}>
      <Card sx={{ p: 2 }}>
        <Grid container columns={12} spacing={1} rowSpacing={1.5} sx={{ flex: '1' }}>
          <Grid size={12}>
            <div>
              <Controller<JournalForm>
                control={control}
                name={isBase ? 'baseEntry.memo' : `children.${childIndex}.memo`}
                render={({ field }) => <TextField size="small" label="Memo" fullWidth {...field} />}
              />
            </div>
          </Grid>
          <Grid size={4}>
            <Controller<JournalForm>
              control={control}
              name={isBase ? 'baseEntry.amount' : `children.${childIndex}.amount`}
              render={({ field }) => <AmountField size="small" approximate={false} {...field} />}
            />
          </Grid>
          <Grid size={'grow'}>
            <Controller<JournalForm>
              control={control}
              name={isBase ? 'baseEntry.topics' : `children.${childIndex}.topics`}
              render={({ field }) => <TopicField size="small" label="Topics" fullWidth {...field} />}
            />
          </Grid>
          <Grid size="auto">
            <Stack direction="row" spacing={-1} ml={-1}>
              <IconButton>
                <LocalOffer />
              </IconButton>
              <IconButton onClick={() => { }}>
                <DeleteOutline />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Card>
      {descendants && (
        <Stack gap={2} ml={4} mt={2}>
          {descendants}
        </Stack>
      )}
    </Stack>
  )
}
