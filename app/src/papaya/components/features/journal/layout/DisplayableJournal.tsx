import { JournalContext } from "@/contexts/JournalContext";
import { JournalSlice } from "@/schema/journal/aggregate";
import { Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { useContext, useMemo } from "react";
import JournalToolbar from "../display/JournalToolbar";
import DisplayableJournalTable from "./DisplayableJournalTable";
import JournalEntryEditor from "./JournalEntryEditor";

interface DisplayableJournalProps {
  slice: JournalSlice;
}

type DisplayableJournalStatus = 'loading' | 'idle' | 'no-journal';

export default function DisplayableJournal(props: DisplayableJournalProps) {
  const journalContext = useContext(JournalContext)

  const status: DisplayableJournalStatus = useMemo(() => {
    if (!journalContext.activeJournalId) {
      return 'no-journal';
    } else if (journalContext.queries.journal.isFetched && !journalContext.queries.journal.data) {
      return 'no-journal';
    } else if (journalContext.queries.journal.isLoading) {
      return 'loading';
    }

    return 'idle';
  }, [journalContext.activeJournalId, journalContext.queries.journal]);

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
            <Grid size={6}>
              {status === 'no-journal' && <Typography variant="body1">No journal selected</Typography>}
              {status === 'loading' && <Typography variant="body1">Loading...</Typography>}
              {status === 'idle' && <DisplayableJournalTable slice={props.slice} />}
            </Grid>
            <Grid size={6} sx={{ display: 'flex', p: 2, background: 'black' }}>
              <JournalEntryEditor />
            </Grid>
          </Grid>
        </Stack>
      </Stack>
    </Stack>
  )
}
