import AmountField from "@/components/shared/inputs/field/AmountField";
import DateField from "@/components/shared/inputs/field/DateField";
import TopicField from "@/components/shared/inputs/field/TopicField";
import { JournalEntryForm } from "@/model/schema/form-schemas";
import { TransactionRid } from "@/model/schema/namespace-schemas";
import { DeleteOutline, LocalOffer } from "@mui/icons-material";
import { Card, Grid, IconButton, Stack, TextField } from "@mui/material";
import dayjs from "dayjs";
import { Controller, useFormContext } from "react-hook-form";

interface TransactionFormProps {
  transactionRid: TransactionRid;
}

export function JournalEntryTransactionForm(props: TransactionFormProps) {
  const { control, register } = useFormContext<JournalEntryForm>()

  return (
    <Stack gap={2}>
      <Card sx={{ p: 2 }}>
        <Grid container columns={12} spacing={1} rowSpacing={1.5} sx={{ flex: '1' }}>
          <Grid size={8}>
            <TextField
              size="small"
              label="Memo"
              fullWidth
              {...register(`transactions.${props.transactionRid}.memo`)}
            />
          </Grid>
          <Grid size={4}>
            <Controller<JournalEntryForm>
              control={control}
              name={`transactions.${props.transactionRid}.date`}
              render={({ field }) => (
                <DateField
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                  label="Date"
                  {...field}
                  value={dayjs(field.value as string)}
                  onChange={(value) => {
                    field.onChange(value?.format('YYYY-MM-DD') ?? '')
                  }}

                />
              )}
            />
          </Grid>
          <Grid size={4}>
            <Controller
              control={control}
              name={`transactions.${props.transactionRid}.amountString`}
              render={({ field }) => (
                <AmountField
                  size="small"
                  approximate={false}
                  {...field}
                  fullWidth
                  sx={{ flex: 1 }}
                  autoComplete="off"
                />
              )}
            />
          </Grid>
          <Grid size={'grow'}>
            <TopicField
              size="small"
              label="Topics"
              fullWidth
              {...register(`transactions.${props.transactionRid}.topics`)}
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
    </Stack>
  )
}