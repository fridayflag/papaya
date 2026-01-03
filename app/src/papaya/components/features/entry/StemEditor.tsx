import { EntrySchema } from '@/schema/new/document/EntrySchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import EntryEditableCard from './EntryEditableCard';


const EntryFormSchema = EntrySchema.extend({
  entry: EntrySchema,
});
export type EntryForm = z.infer<typeof EntryFormSchema>;

export default function StemEditor() {
  const form = useForm<EntryForm>({
    resolver: zodResolver(EntryFormSchema),
    defaultValues: {
      entry: {
        _id: 'papaya:entry:1234',
        date: new Date().toISOString(),
        time: new Date().toISOString(),
        journalId: 'papaya:journal:1234',
        sourceAccount: '&rbc-checking',
        memo: '',
        amount: {
          currency: 'CAD',
          '@ephemeral': {
            rawValue: '100',
          },
        },
      },
      stems: {},
    }
  })

  const entry = form.watch('entry');

  return (
    <Box>
      <FormProvider {...form}>
        <form>
          <EntryEditableCard entryId={entry._id} />
        </form>
      </FormProvider>
    </Box >
  )
}
