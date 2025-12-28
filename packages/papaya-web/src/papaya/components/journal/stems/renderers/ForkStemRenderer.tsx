import { Button, Stack } from '@mui/material';
import { Add } from '@mui/icons-material';
import { StemRendererProps } from '../StemRegistry';
import { ForkStemSchema } from '@/schema/new/stem/ForkStemSchema';
import { EntryIdentifier, Entry } from '@/schema/new/document/EntrySchema';
import EntryEditableCard from '../../EntryEditableCard';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

type ForkStemRendererProps = StemRendererProps<typeof ForkStemSchema>;

export default function ForkStemRenderer({ stem, stemPrn, form, entryId }: ForkStemRendererProps) {
  const subentries = stem.subentries || {};
  const subentryIds = Object.keys(subentries) as EntryIdentifier[];

  const handleAddSubentry = () => {
    const entryPrn = `papaya:entry:${uuidv4()}` as const;
    const entry = form.getValues('entry');
    
    const newEntry: Entry = {
      _id: entryPrn,
      prn: entryPrn,
      '@version': 1,
      date: entry.date,
      time: entry.time,
      journalId: entry.journalId,
      sourceAccount: entry.sourceAccount,
      memo: '',
      amount: {
        currency: entry.amount.currency,
        '@ephemeral': {
          rawValue: '0',
        },
      },
      '@derived': {
        netAmount: {
          currency: entry.amount.currency,
          value: 0,
        },
      },
    };

    // Update the fork stem's subentries
    const currentEntry = form.getValues('entry');
    const currentStems = currentEntry.stems || {};
    const currentFork = currentStems[stemPrn] as z.infer<typeof ForkStemSchema>;
    form.setValue(`entry.stems.${stemPrn}.subentries`, {
      ...currentFork.subentries,
      [entryPrn]: newEntry,
    });
  };

  return (
    <Stack gap={2}>
      {subentryIds.map((subentryId) => (
        <EntryEditableCard key={subentryId} entryId={subentryId} />
      ))}
      <Button
        size="small"
        variant="outlined"
        startIcon={<Add />}
        onClick={handleAddSubentry}
      >
        Add Subentry
      </Button>
    </Stack>
  );
}

