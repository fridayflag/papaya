import { DEFAULT_CURRENCY } from "@/constants/settings";
import { useUserPreferences } from "@/hooks/state/useUserPreferences";
import { JournalForm, JournalFormSchema } from "@/schema/form/journal";
import { JournalUrn } from "@/schema/support/urn";
import { getJournalEntryFromDisplayableEntry } from "@/utils/aggregate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@mui/material";
import dayjs from "dayjs";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import JournalEntryFormSummary from "../display/JournalEntryFormSummary";
import JournalEntryForm from "../form/JournalEntryForm";

interface JournalEntryEditorProps {
  journalId: JournalUrn;
  editingDisplayableEntryId: string;
}

export default function JournalEntryEditor(props: JournalEntryEditorProps) {
  const userPreferences = useUserPreferences();
  const currency = userPreferences?.journal.currency.entry ?? DEFAULT_CURRENCY;

  const formInitialValues = useMemo(() => {
    if (props.editingDisplayableEntryId) {
      const entry = getJournalEntryFromDisplayableEntry(props.editingDisplayableEntryId);
      return deserializeEntryToJournalForm(entry);
    } else {
      return {
        baseEntry: {
          memo: '',
          amount: '',
          date: dayjs().format('YYYY-MM-DD'),
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
      }
    }
  }, [props.editingDisplayableEntryId]);

  const form = useForm<JournalForm>({
    resolver: zodResolver(JournalFormSchema),
    defaultValues: {
      ...formInitialValues,
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
