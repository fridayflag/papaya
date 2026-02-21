import DateField from '@/components/input/field/DateField';
import TopicField from '@/components/input/field/TopicField';
import { putJournalEntry } from '@/database/actions';
import { JournalFormCodec } from '@/schema/codec-schemas';
import { JournalEntryForm, JournalEntryFormSchema } from '@/schema/form-schemas';
import { Entry } from '@/schema/journal/resource/documents';
import { JournalUrn, TransactionUrn } from "@/schema/support/urn";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeleteOutline, LocalOffer } from '@mui/icons-material';
import { Button, Card, Grid, IconButton, Stack, TextField } from "@mui/material";
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
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
            <Controller
              control={control}
              name={`${props.prefix}.amountString`}
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
              {...register(`${props.prefix}.topicsString`)}
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
  editingEntry: Entry;
  onSaved: () => void;
}

export default function JournalEntryEditor(props: JournalEntryEditorProps) {
  const initialFormValues: JournalEntryForm = useMemo(() => {
    return JournalFormCodec.decode(props.editingEntry);
  }, [props.editingEntry]);

  const form = useForm<JournalEntryForm>({
    resolver: zodResolver(JournalEntryFormSchema),
    defaultValues: initialFormValues,
  });

  const resetForm = () => {
    form.reset(initialFormValues);
  };

  useEffect(() => {
    resetForm();
  }, [props.editingEntry]);

  const handleSave = async (formData: JournalEntryForm) => {
    const marshalledEntry: Entry = JournalFormCodec.encode(formData);
    const mergedEntry: Entry = {
      /**
       * Need to merge the editing entry with the marshalled entry to ensure
       * ID and revision number are preserved.
       */
      ...props.editingEntry,
      ...marshalledEntry,
    }
    try {
      await putJournalEntry(mergedEntry);
      props.onSaved();
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  }

  return (
    <FormProvider {...form}>
      <Stack gap={1} component="form" onSubmit={form.handleSubmit(handleSave)} sx={{ flex: 1 }}>
        <Button type="submit" variant="contained">Save</Button>
        <JournalEntryFormSummary />
        <EditTransactionForm prefix="rootTransaction" />
      </Stack>
    </FormProvider>
  )
}
