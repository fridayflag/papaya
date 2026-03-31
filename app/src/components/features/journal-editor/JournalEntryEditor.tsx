'use client';

import JournalEntryFormSummary from '@/components/features/journal-editor/JournalEntryFormSummary';
import { SimpleJournalEntryForm } from '@/components/features/journal-entry-form/SimpleJournalEntryForm';
// import JournalEntryFormSummary from '@/components/features/journal-editor/JournalEntryFormSummary';
import DetailsDrawer from '@/components/shared/navigation/DetailsDrawer';
import { JournalEntryEditorContext } from '@/model/contexts/JournalEntryEditorContext';
import { journalEntryRepository } from '@/model/orm/repositories';
import { JournalEntryToFormCodec } from '@/model/schema/codec-schemas';
import { JournalEntryForm } from '@/model/schema/form-schemas';
import { Button, Stack } from "@mui/material";
import { useContext, useState } from 'react';
import { FormProvider } from "react-hook-form";


export default function JournalEntryEditor() {
  const { form } = useContext(JournalEntryEditorContext);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: JournalEntryForm) => {
    if (saving) {
      return;
    }

    setSaving(true);
    try {
      const journalEntry = JournalEntryToFormCodec.encode(data);
      await journalEntryRepository.Model.save(journalEntry);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DetailsDrawer open={true} onClose={() => { }}>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Stack sx={{ flex: 1, gap: 1 }}>
            <Button type="submit" variant="contained">Save</Button>
            <JournalEntryFormSummary />
            <SimpleJournalEntryForm />
          </Stack>
        </form>
      </FormProvider>
    </DetailsDrawer>
  );
}
