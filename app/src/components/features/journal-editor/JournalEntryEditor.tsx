'use client';

import JournalEntryFormSummary from '@/components/features/journal-editor/JournalEntryFormSummary';
import { SimpleJournalEntryForm } from '@/components/features/journal-entry-form/SimpleJournalEntryForm';
// import JournalEntryFormSummary from '@/components/features/journal-editor/JournalEntryFormSummary';
import DetailsDrawer from '@/components/shared/navigation/DetailsDrawer';
import { JournalEntryEditorContext } from '@/model/contexts/JournalEntryEditorContext';
import { Button, Stack } from "@mui/material";
import { PropsWithChildren, useContext } from 'react';
import { FormProvider } from "react-hook-form";


export default function JournalEntryEditor(props: PropsWithChildren) {
  const { form } = useContext(JournalEntryEditorContext);
  return (
    <DetailsDrawer open={true} onClose={() => { }}>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(() => { })}>
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
