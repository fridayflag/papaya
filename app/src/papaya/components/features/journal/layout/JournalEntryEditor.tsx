import DateField from '@/components/input/field/DateField';
import TopicField from '@/components/input/field/TopicField';
import { DEFAULT_CURRENCY } from '@/constants/settings';
import { useUserPreferences } from '@/hooks/state/useUserPreferences';
import { JournalFormCodec } from '@/schema/codec-schemas';
import { JournalEntryForm, JournalEntryFormSchema } from '@/schema/form-schemas';
import { Entry } from '@/schema/journal/resource/documents';
import { makeJournalEntry } from '@/schema/support/factory';
import { JournalUrn, TransactionUrn } from "@/schema/support/urn";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeleteOutline, LocalOffer } from '@mui/icons-material';
import { Card, Grid, IconButton, Stack, TextField } from "@mui/material";
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import AmountField from '../../../input/field/AmountField';
import JournalEntryFormSummary from '../display/JournalEntryFormSummary';

interface EditTransactionFormProps {
  prefix: 'rootTransaction' | `childTransactions.${TransactionUrn}`;
}

function EditTransactionForm(props: EditTransactionFormProps) {
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
              {...register(`${props.prefix}.memo`)}
            />
          </Grid>
          <Grid size={4}>
            <Controller<JournalEntryForm>
              control={control}
              name={`${props.prefix}.date`}
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
            <AmountField
              size="small"
              approximate={false}
              {...register(`${props.prefix}.amount`)}
            />
          </Grid>
          <Grid size={'grow'}>
            <TopicField
              size="small"
              label="Topics"
              fullWidth
              {...register(`${props.prefix}.topics`)}
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

interface JournalEntryEditorProps {
  journalId: JournalUrn;
  editingEntry: Entry | null;
}

export default function JournalEntryEditor(props: JournalEntryEditorProps) {
  const settings = useUserPreferences();
  const currency = settings?.journal.currency.entry ?? DEFAULT_CURRENCY;

  const initialFormValues: JournalEntryForm = useMemo(() => {
    return JournalFormCodec.decode(props.editingEntry ?? makeJournalEntry(props.journalId, currency));
  }, [props.editingEntry, props.journalId, currency]);

  const form = useForm<JournalEntryForm>({
    resolver: zodResolver(JournalEntryFormSchema),
    defaultValues: initialFormValues,
  })

  return (
    <FormProvider {...form}>
      <Stack gap={1} component="form" sx={{ flex: 1 }}>
        <JournalEntryFormSummary />
        <EditTransactionForm prefix="rootTransaction" />
      </Stack>
    </FormProvider>
  )
}
