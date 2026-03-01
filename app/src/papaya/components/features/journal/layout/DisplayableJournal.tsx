import { DEFAULT_CURRENCY } from "@/constants/settings";
import { JournalContext } from "@/contexts/JournalContext";
import { JournalEntryEditorContext } from "@/contexts/JournalEntryEditorContext";
import { JournalSliceContext } from "@/contexts/JournalSliceContext";
import { useActiveJournalEntries } from "@/hooks/queries";
import { useUserPreferences } from "@/hooks/state/useUserPreferences";
import { EntryUrn } from "@/schema/support/urn";
import { Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { useContext, useMemo } from "react";
import JournalToolbar from "../display/JournalToolbar";
import DisplayableJournalTable from "./DisplayableJournalTable";
import JournalEntryEditor from "./JournalEntryEditor";

type DisplayableJournalStatus = 'loading' | 'idle' | 'no-journal';

export default function DisplayableJournal() {
  const journalContext = useContext(JournalContext);
  const { slice } = useContext(JournalSliceContext);
  const {
    beginEditing,
    beginCreating,
    closeEditor,
    isEditorOpen,
    editingEntry,
  } = useContext(JournalEntryEditorContext);
  const activeJournalId = journalContext.activeJournalId;

  const settings = useUserPreferences();
  const currency = settings?.journal.currency.entry ?? DEFAULT_CURRENCY;

  const journalEntriesQuery = useActiveJournalEntries();

  const handleSelectForEdit = (entryUrn: EntryUrn) => {
    const entry = journalEntriesQuery.data?.[entryUrn] ?? null;
    if (entry) {
      beginEditing(entry);
    }
  };

  const showEditor = true; //isEditorOpen;

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

  return (
    <>
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
            <JournalToolbar />
            <Divider />
            <Grid
              container
              columns={12}
              sx={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 0, // Allow flex item to shrink
              }}>
              <Grid size={12}>
                {status === 'no-journal' && <Typography variant="body1">No journal selected</Typography>}
                {status === 'loading' && <Typography variant="body1">Loading...</Typography>}
                {status === 'idle' && <DisplayableJournalTable slice={slice} onSelectForEdit={handleSelectForEdit} />}
              </Grid>
            </Grid>
          </Stack>
        </Stack>
      </Stack>
      <JournalEntryEditor
        onSaved={() => {
          closeEditor();
          journalEntriesQuery.refetch();
        }}
      />
    </>
  )
}
