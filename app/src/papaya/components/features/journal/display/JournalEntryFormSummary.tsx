import { DEFAULT_CURRENCY } from "@/constants/settings";
import { useUserPreferences } from "@/hooks/state/useUserPreferences";
import { DisplayableJournalEntry } from "@/schema/aggregate-schemas";
import { JournalFormCodec } from "@/schema/codec-schemas";
import { JournalEntryForm } from "@/schema/form-schemas";
import { Entry } from "@/schema/journal/resource/documents";
import { AccountSlug, TopicSlug } from "@/schema/journal/string";
import { makeFigure } from "@/schema/support/factory";
import { makeDisplayableJournalEntry } from "@/utils/aggregate-utils";
import { getMonetaryEnumerationString } from "@/utils/string";
import { Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

export default function JournalEntryFormSummary() {
  const { watch } = useFormContext<JournalEntryForm>()
  const entryUrn = watch('entryUrn');
  const journalUrn = watch('journalUrn');

  const defaultDate = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

  const settings = useUserPreferences();
  const currency = settings?.journal.currency.entry ?? DEFAULT_CURRENCY;


  const defaultDisplayableEntry: DisplayableJournalEntry = useMemo(() => {
    return {
      entryUrn,
      journalUrn,
      aggregate: {
        memo: '',
        date: defaultDate,
        topics: new Set<TopicSlug>(),
        accounts: new Set<AccountSlug>(),
        sum: {},
      },
      primaryAction: null,
      secondaryAction: null,
      stamps: [],
      rootTransaction: {
        date: defaultDate,
        memo: '',
        transactionUrn: null,
        figure: makeFigure(0, currency),
        sourceAccount: null,
        destinationAccount: null,
        topics: [],
        children: [],
      },
    };
  }, [entryUrn, journalUrn, defaultDate, currency]);

  const baseEntryMemo = watch('rootTransaction.memo');
  const formValues = watch();

  const marshalledEntry: Entry = useMemo(() => {
    // TODO use debouncing
    return JournalFormCodec.encode(formValues);
  }, [formValues]);

  const displayableEntry: DisplayableJournalEntry = useMemo(() => {
    return makeDisplayableJournalEntry(marshalledEntry) ?? defaultDisplayableEntry;
  }, [marshalledEntry, defaultDisplayableEntry]);

  const netAmountString = getMonetaryEnumerationString(displayableEntry.aggregate.sum, {
    sign: 'whenPositive',
    symbol: 'simplified',
    fullyQualifyZero: false,
  })

  return (
    <Stack>
      <Typography>{baseEntryMemo.trim() || 'Journal entry'}</Typography>

      <Stack direction="row" gap={2}>
        <Typography>{netAmountString}</Typography>
        <Typography>{Array.from(displayableEntry.aggregate.topics).join(', ')}</Typography>
      </Stack>
    </Stack>
  )
}
