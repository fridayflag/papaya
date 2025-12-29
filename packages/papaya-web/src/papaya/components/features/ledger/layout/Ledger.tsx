import { Box, Divider, Paper, Stack } from "@mui/material"
import dayjs from "dayjs"
import LedgerToolbar from "../display/LedgerToolbar"
import LedgerGrid, { type DisplayableLedgerEntry } from "./LedgerGrid"

const SAMPLE_DATA: DisplayableLedgerEntry[] = [
  {
    date: dayjs('2025-01-01'),
    netAmount: {
      value: 100,
      currency: 'CAD',
    },
    memo: 'Sample memo',
    topics: ['#sample-topic'],
    accounts: {
      source: {
        label: 'Sample source',
      },
    },
    badges: [],
  },
  {
    date: dayjs('2025-01-02'),
    netAmount: {
      value: 200,
      currency: 'CAD',
    },
    memo: 'Sample memo 2',
    topics: ['#sample-topic', '#sample-topic-2'],
    accounts: {
      destination: {
        label: 'Sample destination',
      },
    },
    badges: ['FLAGGED'],
  },
  {
    date: dayjs('2025-01-03'),
    netAmount: {
      value: 300,
      currency: 'CAD',
    },
    memo: 'Sample memo 3',
    topics: ['#sample-topic-3'],
    accounts: {
      source: {
        label: 'Sample source 3',
      },
    },
    badges: [],
  },
]

interface LedgerProps {

}

export default function Ledger(props: LedgerProps) {
  const entries: DisplayableLedgerEntry[] = SAMPLE_DATA

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
          <LedgerToolbar />
          <Divider />
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              minHeight: 0, // Allow flex item to shrink
            }}>
            <LedgerGrid entries={entries} />
          </Box>
        </Stack>
      </Stack>
    </Stack>
  )
}
