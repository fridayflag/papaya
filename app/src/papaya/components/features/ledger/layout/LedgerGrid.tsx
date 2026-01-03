import { type TopicSlug } from "@/schema/new/document/TopicSchema"
import { type AdornedResource } from "@/schema/new/object/AdornedResourceSchema"
import { type ComputedAmount } from "@/schema/new/object/ComputedAmountSchema"
import { type DecoratedSlug } from "@/schema/new/object/DecoratedSlug"
import { sortDatesChronologically } from '@/utils/date'
import {
  Chip,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  TableRow as MuiTableRow,
  Stack,
  Table,
  TableBodyProps,
  TableCellProps,
  TableRowProps,
  Typography
} from '@mui/material'
import dayjs from "dayjs"
import { useMemo } from 'react'
import LedgerEntryDate from '../display/LedgerEntryDate'

type DisplayableBadge =
  | 'FLAGGED'

export interface DisplayableLedgerEntry {
  date: dayjs.Dayjs
  netAmount: ComputedAmount
  memo: string
  topics: TopicSlug[]
  accounts: {
    source?: AdornedResource | DecoratedSlug
    destination?: AdornedResource | DecoratedSlug
  }
  badges: DisplayableBadge[]
}


interface JournalTableRowProps extends TableRowProps {
  dateRow?: boolean
}

const TableRow = ({ sx, dateRow, ...rest }: JournalTableRowProps) => {
  return (
    <MuiTableRow
      hover={!dateRow}
      sx={{
        '& td': {
          ...(dateRow
            ? {
              width: '0%',
              cursor: 'default',
            }
            : {}),
        },
        ...sx,
      }}
      {...rest}
    />
  )
}

interface JournalTableCellProps extends Omit<TableCellProps, 'colSpan'> {
  colSpan?: string | number
}

const TableCell = (props: JournalTableCellProps) => {
  const { sx, colSpan, ...rest } = props

  return (
    <MuiTableCell
      {...rest}
      colSpan={colSpan as number}
      sx={{
        border: 0,
        alignItems: 'center',
        px: 1,
        ...sx,
      }}
    />
  )
}

type JournalTableBodyProps = TableBodyProps

const TableBody = (props: JournalTableBodyProps) => {
  const { sx, ...rest } = props

  return (
    <MuiTableBody
      {...rest}
      sx={(theme) => ({
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&::before, &::after': {
          content: `""`,
          display: 'table-row',
          height: theme.spacing(1),
        },
        ...(sx as any),
      })}
    />
  )
}



interface LedgerGridProps {
  entries: DisplayableLedgerEntry[]
}

const formatAmount = (amount: ComputedAmount): string => {
  const symbol = amount.currency === 'CAD' ? 'C$' : '$'
  const value = Math.abs(amount.value)
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const sign = amount.value >= 0 ? '+' : '-'
  return `${sign}${symbol}${formatted}`
}

export default function LedgerGrid(props: LedgerGridProps) {
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
