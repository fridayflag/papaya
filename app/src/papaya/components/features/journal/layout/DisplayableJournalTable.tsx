import { JournalView } from "@/schema/journal/aggregate"
import { Figure } from '@/schema/journal/entity/figure'
import { sortDatesChronologically } from '@/utils/date'
import {
  Chip,
  Stack,
  Table,
  Typography
} from '@mui/material'
import dayjs from "dayjs"
import { useMemo } from 'react'
import LedgerEntryDate from '../display/JournalEntryDate'


interface DisplayableJournalTableProps {
  view: JournalView;
}

const formatFigure = (figure: Figure): string => {
  const symbol = figure.currency === 'CAD' ? 'C$' : '$'
  const value = Math.abs(figure.amount)
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const sign = figure.amount >= 0 ? '+' : '-'
  return `${sign}${symbol}${formatted}`
}

export default function DisplayableJournalTable(props: DisplayableJournalTableProps) {
  const entriesByDate = useMemo(() => {
    const grouped: Record<string, DisplayableLedgerEntry[]> = {}

    for (const entry of props.entries) {
      const dateKey = entry.date.format('YYYY-MM-DD')
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(entry)
    }

    // Sort entries within each date group (if needed)
    for (const dateKey in grouped) {
      grouped[dateKey].sort((a, b) => {
        // Sort by date first, then by memo
        const dateCompare = a.date.valueOf() - b.date.valueOf()
        if (dateCompare !== 0) return dateCompare
        return a.memo.localeCompare(b.memo)
      })
    }

    return grouped
  }, [props.entries])

  const sortedDates = useMemo(() => {
    return sortDatesChronologically(...Object.keys(entriesByDate))
  }, [entriesByDate])

  return (
    <Table size="small" sx={{ overflowY: 'scroll' }}>
      {sortedDates.map((date: string) => {
        const entries = entriesByDate[date] ?? []
        const day = dayjs(date)
        const isToday = day.isSame(dayjs(), 'day')

        return (
          <TableBody key={date}>
            <TableRow
              dateRow
              sx={{
                verticalAlign: entries.length > 1 ? 'top' : undefined,
              }}>
              <TableCell rowSpan={entries.length + 1}>
                <LedgerEntryDate
                  day={day}
                  isToday={isToday}
                />
              </TableCell>
            </TableRow>

            {entries.map((entry, index) => {
              return (
                <TableRow key={`${date}-${index}-${entry.memo}`}>
                  <TableCell sx={{ width: '30%' }}>
                    <Typography>{entry.memo}</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ width: '15%' }}>
                    <Typography>{formatAmount(entry.netAmount)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                      {entry.topics.map((topic) => (
                        <Chip key={topic} label={topic} size="small" />
                      ))}
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        )
      })}
    </Table>
  )
}
