'use client';

// import JournalEntryFormSummary from '@/components/features/journal-editor/JournalEntryFormSummary';
import { TransactionForm } from '@/components/features/journal-editor/TransactionForm';
import DetailsDrawer from '@/components/shared/navigation/DetailsDrawer';
import { Button, Stack } from "@mui/material";
import { PropsWithChildren } from 'react';
import { FormProvider, useForm } from "react-hook-form";


export default function JournalEntryEditor(props: PropsWithChildren) {


  const form = useForm<unknown>({
    // resolver: zodResolver(JournalEntryFormSchema),
  });

  return (
    <DetailsDrawer open={true} onClose={() => { }}>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(() => { })}>
          <Stack sx={{ flex: 1, gap: 1 }}>
            <Button type="submit" variant="contained">Save</Button>
            {/* <JournalEntryFormSummary /> */}
            <TransactionForm prefix="rootTransaction" />
          </Stack></form>
      </FormProvider>
    </DetailsDrawer>
  );
}
