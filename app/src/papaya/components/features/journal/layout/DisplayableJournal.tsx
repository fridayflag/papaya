import { Box, Divider, Paper, Stack } from "@mui/material"
import JournalToolbar from "../display/JournalToolbar"
import DisplayableJournalTable from "./DisplayableJournalTable"

export default function DisplayableJournal() {
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
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              minHeight: 0, // Allow flex item to shrink
            }}>
            <DisplayableJournalTable view={view} />
          </Box>
        </Stack>
      </Stack>
    </Stack>
  )
}
