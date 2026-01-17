import { DEFAULT_CURRENCY } from "@/constants/settings";
import { useActiveJournalEntries, useActiveJournalIndex } from "@/hooks/queries";
import { useUserPreferences } from "@/hooks/state/useUserPreferences";
import { JournalForm } from "@/schema/form/journal";
import { DisplayableJournalEntry } from "@/schema/journal/aggregate";
import { makeFigure } from "@/schema/support/factory";
import { makeDisplayableJournalEntry } from "@/utils/aggregate";
import { getFigureString } from "@/utils/string";
import { Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useId, useMemo } from "react";
import { useFormContext } from "react-hook-form";


export default function JournalEntryFormSummary() {
  const { watch } = useFormContext<JournalForm>()

  const displayableEntryFallbackId = useId();
  const defaultDate = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

  const settings = useUserPreferences();
  const currency = settings?.journal.currency.entry ?? DEFAULT_CURRENCY;
  const indexQuery = useActiveJournalIndex()
  const entriesQuery = useActiveJournalEntries();

  const baseEntryMemo = watch('root.memo');
  const formValues = watch(); // TODO don't watch all values, but get them on debounce/onblur

  const displayableEntry: DisplayableJournalEntry = useMemo(() => {
    if (!indexQuery.data) {
      return {
        displayableEntryId: displayableEntryFallbackId,
        reference: null,
        date: defaultDate,
        memo: baseEntryMemo,
        netAmount: makeFigure(0, currency),
        topics: [],
        sourceAccount: null,
        destinationAccount: null,
        primaryAction: null,
        secondaryAction: null,
        stamps: [],
        children: [],
      } satisfies DisplayableJournalEntry;
    }

    const serialized = serializeJournalForm({
      ...formValues,
      baseEntry: {
        ...formValues.baseEntry,
        memo: baseEntryMemo,
      },
    });
    return makeDisplayableJournalEntry(serialized, entriesQuery.data);
  }, [
    baseEntryMemo,
    formValues,
    entriesQuery.data,
    displayableEntryFallbackId,
    defaultDate,
    currency,
    indexQuery.data,
  ]);

  const netAmountString = getFigureString(displayableEntry.netAmount, {
    sign: 'whenPositive',
    symbol: 'simplified',
    fullyQualifyZero: false,
  })

  return (
    <Stack>
      <Typography>{baseEntryMemo.trim() || 'Journal entry'}</Typography>

      <Stack direction="row" gap={2}>
        <Typography>{netAmountString}</Typography>
        <Typography>{displayableEntry.topics.join(', ')}</Typography>
      </Stack>
    </Stack>
  )
}
