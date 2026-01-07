import { DEFAULT_CURRENCY } from "@/constants/settings";
import { JournalContext } from "@/contexts/JournalContext";
import { useActiveJournalIndex, useJournalEntries } from "@/hooks/queries";
import { JournalForm } from "@/schema/form/journal";
import { DisplayableJournalEntry } from "@/schema/journal/aggregate";
import { CurrencyIso4217 } from "@/schema/journal/money";
import { makeFigure } from "@/schema/support/factory";
import { makeDisplayableJournalEntry } from "@/utils/aggregate";
import { serializeJournalForm } from "@/utils/form";
import { Stack, Typography } from "@mui/material";
import { useContext, useId, useMemo } from "react";
import { useFormContext } from "react-hook-form";


export default function JournalEntryFormSummary() {
  const { getValues } = useFormContext<JournalForm>()

  const defaultDisplayableEntryId = useId();
  const defaultDate = useMemo(() => new Date().toISOString(), []);

  const { activeJournalId, queries: { journal: journalQuery } } = useContext(JournalContext);
  const defaultCurrency: CurrencyIso4217 = journalQuery.data?.settings.currency.entry ?? DEFAULT_CURRENCY;

  const journalEntriesQuery = useJournalEntries(activeJournalId);
  const activeJournalIndexQuery = useActiveJournalIndex()

  const formValues = getValues();

  const displayableEntry: DisplayableJournalEntry = useMemo(() => {
    if (!journalEntriesQuery.data || !activeJournalIndexQuery.data) {
      return {
        displayableEntryId: defaultDisplayableEntryId,
        date: defaultDate,
        memo: '',
        netAmount: makeFigure(defaultCurrency),
        topics: [],
        sourceAccount: null,
        destinationAccount: null,
        primaryAction: null,
        secondaryAction: null,
        stamps: [],
        children: [],
      } satisfies DisplayableJournalEntry;
    }
    const serialized = serializeJournalForm(formValues);
    return makeDisplayableJournalEntry(serialized, journalEntriesQuery.data);
  }, [formValues, journalEntriesQuery.data, activeJournalIndexQuery.data]);

  return (
    <Stack>
      <Typography>{displayableEntry.memo ?? 'Journal entry'}</Typography>

      <Stack direction="row" gap={2}>
        <Typography>{JSON.stringify(displayableEntry.netAmount)}</Typography>
        <Typography>{displayableEntry.topics.join(', ')}</Typography>
      </Stack>
    </Stack>
  )
}
