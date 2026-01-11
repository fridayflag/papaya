import { DEFAULT_CURRENCY } from "@/constants/settings";
import { useUserPreferences } from "@/hooks/state/useUserPreferences";
import { JournalForm, JournalFormSchema } from "@/schema/form/journal";
import { JournalUrn } from "@/schema/support/urn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import JournalEntryFormSummary from "../display/JournalEntryFormSummary";
import JournalEntryForm from "../form/JournalEntryForm";

interface JournalEntryEditorProps {
  journalId: JournalUrn;
}

export default function JournalEntryEditor(props: JournalEntryEditorProps) {
  const userPreferences = useUserPreferences();
  const currency = userPreferences?.journal.currency.entry ?? DEFAULT_CURRENCY;

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
        urn: null,
      },
      childEntries: [],
      context: {
        journalId: props.journalId,
        currency,
      },
    } satisfies JournalForm,
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
