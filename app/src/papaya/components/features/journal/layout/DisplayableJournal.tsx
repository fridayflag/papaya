import { DEFAULT_CURRENCY } from "@/constants/settings";
import { JournalContext } from "@/contexts/JournalContext";
import { useActiveJournalEntries } from "@/hooks/queries";
import { useUserPreferences } from "@/hooks/state/useUserPreferences";
import { JournalSlice } from "@/schema/aggregate-schemas";
import { Entry } from "@/schema/journal/resource/documents";
import { makeJournalEntry } from "@/schema/support/factory";
import { EntryUrn } from "@/schema/support/urn";
import { Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { useContext, useMemo, useState } from "react";
import JournalToolbar from "../display/JournalToolbar";
import DisplayableJournalTable from "./DisplayableJournalTable";
import JournalEntryEditor from "./JournalEntryEditor";

interface DisplayableJournalProps {
  slice: JournalSlice;
}

type DisplayableJournalStatus = 'loading' | 'idle' | 'no-journal';

export default function DisplayableJournal(props: DisplayableJournalProps) {
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const journalContext = useContext(JournalContext)
  const activeJournalId = journalContext.activeJournalId;

  const settings = useUserPreferences();
  const currency = settings?.journal.currency.entry ?? DEFAULT_CURRENCY;

  const handleSelectForEdit = (entryUrn: EntryUrn) => {
    const entry = journalEntriesQuery.data?.[entryUrn] ?? null;
    setEditingEntry(entry);
  }

  const journalEntriesQuery = useActiveJournalEntries();

  const showEditor = !!editingEntry;

  const status: DisplayableJournalStatus = useMemo(() => {
    if (!activeJournalId) {
      return 'no-journal';
    } else if (journalContext.queries.journal.isFetched && !journalContext.queries.journal.data) {
      return 'no-journal';
    } else if (journalContext.queries.journal.isLoading) {
      return 'loading';
    }

    return 'idle';
  }, [activeJournalId, journalContext.queries.journal]);

  const handleNewEntry = () => {
    if (!activeJournalId) {
      return;
    }
    const entry = makeJournalEntry(activeJournalId, currency);
    setEditingEntry(entry);
  }

  return (
    <Stack
      direction="row"
      sx={{
        gap: 2,
        height: '100%',
        width: '100%',
        pb: { sm: 0, md: 2 },
      }}
    >
      <Stack
        sx={{
          flex: 1,
          gap: 0,
          height: '100%',
          width: '100%',
        }}
      >
        <Stack
          component={Paper}
          sx={(theme) => ({
            flex: 1,
            borderTopLeftRadius: theme.spacing(2),
            borderTopRightRadius: theme.spacing(2),
            borderBottomLeftRadius: { sm: 0, md: theme.spacing(2) },
            borderBottomRightRadius: { sm: 0, md: theme.spacing(2) },
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0, // Allow flex item to shrink
          })}>
          <JournalToolbar onNewEntry={handleNewEntry} />
          <Divider />
          <Grid
            container
            columns={12}
            sx={{
              flex: 1,
              overflowY: 'auto',
              minHeight: 0, // Allow flex item to shrink
            }}>
            <Grid size={showEditor ? 6 : 12}>
              {status === 'no-journal' && <Typography variant="body1">No journal selected</Typography>}
              {status === 'loading' && <Typography variant="body1">Loading...</Typography>}
              {status === 'idle' && <DisplayableJournalTable slice={props.slice} onSelectForEdit={handleSelectForEdit} />}
            </Grid>
            {showEditor && activeJournalId && (
              <Grid size={6} sx={{ display: 'flex', p: 2, background: 'black' }}>
                <JournalEntryEditor
                  journalId={activeJournalId}
                  editingEntry={editingEntry}
                  onSaved={() => {
                    setEditingEntry(null);
                    journalEntriesQuery.refetch();
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Stack>
      </Stack>
    </Stack>
  )
}
