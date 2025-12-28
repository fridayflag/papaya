import { Entry, EntryIdentifier } from '@/schema/new/document/EntrySchema';
import { Prn } from '@/schema/new/other/PapayaResourceNameSchema';
import { Button, Stack } from '@mui/material';
import { UseFormReturn } from 'react-hook-form';
import { EntryForm } from '../StemEditor';
import { StemDefinition, StemRegistry } from './StemRegistry';

interface StemActionsProps {
  entryId: EntryIdentifier;
  form: UseFormReturn<EntryForm>;
  existingStems: Entry['stems'];
}

/**
 * Component that renders buttons to add available stems to an entry
 */
export default function StemActions({ entryId, form, existingStems }: StemActionsProps) {
  const availableStems = StemRegistry.getAvailableStems(entryId, existingStems);

  const handleAddStem = (stemDef: StemDefinition) => {
    const newStem = stemDef.createDefault() as { prn: Prn;[key: string]: any };
    const stemPrn = newStem.prn;

    // Update form with new stem in entry.stems
    const currentEntry = form.getValues('entry');
    const currentStems = currentEntry.stems || {};
    form.setValue('entry.stems', {
      ...currentStems,
      [stemPrn]: newStem,
    });
  };

  if (availableStems.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" gap={1} flexWrap="wrap">
      {availableStems.map((stemDef) => (
        <Button
          key={stemDef.id}
          size="small"
          variant="outlined"
          startIcon={stemDef.icon}
          onClick={() => handleAddStem(stemDef)}
        >
          Add {stemDef.label}
        </Button>
      ))}
    </Stack>
  );
}

