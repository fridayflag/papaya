import { JournalForm, JournalFormSchema } from "@/schema/form/journal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import JournalEntryFormSummary from "../display/JournalEntryFormSummary";
import JournalEntryForm from "../form/JournalEntryForm";

export default function JournalEntryEditor() {
  const form = useForm<JournalForm>({
    resolver: zodResolver(JournalFormSchema),
    defaultValues: {
      baseEntry: {
        memo: 'Base Entry',
        amount: '',
        date: new Date().toISOString(),
        topics: [],
        sourceAccount: null,
        destinationAccount: null,
      },
      children: [
        {
          memo: 'Child 1',
          amount: '5',
          date: new Date().toISOString(),
          topics: [],
          sourceAccount: null,
          destinationAccount: null,
        },
        {
          memo: 'Child 2',
          amount: '10',
          date: new Date().toISOString(),
          topics: [],
          sourceAccount: null,
          destinationAccount: null,
        },
      ],
    },
  })
  return (
    <FormProvider {...form}>
      <Stack gap={1} component="form" sx={{ flex: 1 }}>
        <JournalEntryFormSummary />
        <JournalEntryForm />
      </Stack>
    </FormProvider>
  )
}
