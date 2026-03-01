import {
  alpha,
  Avatar,
  Button,
  Checkbox,
  Chip,
  Grow,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  TableRow as MuiTableRow,
  Stack,
  Table,
  TableBodyProps,
  TableCellProps,
  TableRowProps,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useEffect, useMemo } from 'react'

import AvatarIcon from '@/components/icon/AvatarIcon'
import { PLACEHOLDER_UNNAMED_JOURNAL_ENTRY_MEMO } from '@/constants/journal'
import { useJournalSlice } from '@/contexts/JournalSliceContext'
import { useAccounts } from '@/hooks/queries/useAccounts'
import { useCategories } from '@/hooks/queries/useCategories'
import { useGetPriceStyle } from '@/hooks/useGetPriceStyle'
import { Account } from '@/schema/documents/Account'
import { Category } from '@/schema/documents/Category'
import { JournalEntry } from '@/schema/documents/JournalEntry'
import { StatusVariant } from '@/schema/models/EntryStatus'
import { EntryTask } from '@/schema/models/EntryTask'
import { Figure } from '@/schema/models/Figure'
import { DateViewVariant } from '@/schema/support/search/facet'
import { useOpenEntryEditModalForCreate } from '@/store/app/useJournalEntryEditModalState'
import {
  useJournalEntrySelectionState,
  useSetJournalEntrySelectionState,
  useToggleJournalEntrySelectionState,
} from '@/store/app/useJournalEntrySelectionState'
import { sortDatesChronologically } from '@/utils/date'
import {
  enumerateJournalEntryStatuses,
  journalEntryHasTags,
  journalEntryHasTasks
} from '@/utils/journal'
import { getFigureString } from '@/utils/string'
import { Flag, LocalOffer, Pending, Update } from '@mui/icons-material'
import clsx from 'clsx'
import dayjs from 'dayjs'
import AvatarChip from '../icon/AvatarChip'
import CircularProgressWithLabel from '../icon/CircularProgressWithLabel'
import QuickJournalEditor from './QuickJournalEditor'

interface JournalTableRowProps extends TableRowProps {
  dateRow?: boolean
  buttonRow?: boolean
}

const TableRow = ({ sx, dateRow, selected, buttonRow, ...rest }: JournalTableRowProps) => {
  const hoverStyles = {
    '.checkbox': { visibility: 'visible' },
    '.icon': { visibility: 'hidden' },
  }

  return (
    <MuiTableRow
      selected={selected}
      hover={!dateRow && !buttonRow}
      sx={{
        '.checkbox': {
          visibility: 'hidden',
        },
        '.icon': {
          visibility: 'visible',
          pointerEvents: 'none',
        },
        '& td': {
          ...(dateRow || buttonRow
            ? {
              cursor: 'default',
            }
            : {}),
          ...(dateRow
            ? {
              width: '0%',
            }
            : {}),
        },
        ...(selected ? hoverStyles : {}),
        '&:hover': hoverStyles,
        userSelect: 'none',
        cursor: 'pointer',
        ...sx,
      }}
      {...rest}
    />
  )
}

interface JournalTableCellProps extends Omit<TableCellProps, 'colSpan'> {
  selectCheckbox?: boolean
  colSpan?: string | number
}

const TableCell = (props: JournalTableCellProps) => {
  const { sx, className, colSpan, selectCheckbox, ...rest } = props

  return (
    <MuiTableCell
      {...rest}
      colSpan={colSpan as number}
      className={clsx(className, {
        '--selectCheckbox': selectCheckbox,
      })}
      sx={{
        border: 0,
        alignItems: 'center',
        px: 1,
        '&.--selectCheckbox': {
          borderTopLeftRadius: '64px',
          borderBottomLeftRadius: '64px',
          overflow: 'hidden',
          position: 'relative',

          '&::after': {
            position: 'absolute',
            inset: 0,
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
            borderImage: `linear-gradient(
							to right,
							rgba(0,0,0,0),
							red
						) 1 100%
						`,
          },
        },
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

interface JournalEntryDateProps {
  day: dayjs.Dayjs
  isToday: boolean
  onClick?: () => void
}

const JournalEntryDate = (props: JournalEntryDateProps) => {
  const { day, isToday, onClick } = props
  // const theme = useTheme();
  // const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack
      component={Button}
      onClick={onClick}
      direction="row"
      alignItems="center"
      gap={1.5}
      sx={{
        py: 0,
        px: 2,
        color: isToday ? undefined : 'unset',
        my: 0,
        ml: 1,
      }}>
      <Avatar
        sx={(theme) => ({
          background: isToday ? theme.palette.primary.main : 'transparent',
          color: isToday ? theme.palette.primary.contrastText : 'inherit',
          minWidth: 'unset',
          m: -1,
          width: theme.spacing(3.5),
          height: theme.spacing(3.5),
        })}>
        {day.format('D')}
      </Avatar>
      <Typography
        sx={(theme) => ({ height: theme.spacing(3.5), lineHeight: theme.spacing(3.5), width: '7ch' })}
        variant="overline"
        color={isToday ? 'primary' : undefined}>
        {day.format('MMM')},&nbsp;{day.format('ddd')}
      </Typography>
    </Stack>
  )
}

interface JournalEntryListProps {
  /**
   * Entries grouped by date, where the key is the date and the value is the
   * array of entries occurring on this date.
   */
  journalRecordGroups: Record<string, JournalEntry[]>
  onClickListItem: (event: any, entry: JournalEntry) => void
  onDoubleClickListItem: (event: any, entry: JournalEntry) => void
}

export default function JournalEntryList(props: JournalEntryListProps) {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const getCategoriesQuery = useCategories()
  const getAccountsQuery = useAccounts()

  const openEntryEditModalForCreate = useOpenEntryEditModalForCreate()

  const journalEntrySelectionState = useJournalEntrySelectionState()
  const toggleJournalEntrySelectionState = useToggleJournalEntrySelectionState()
  const setJournalEntrySelectionState = useSetJournalEntrySelectionState()

  useEffect(() => {
    setJournalEntrySelectionState({})
  }, [props.journalRecordGroups])

  const { slice } = useJournalSlice()
  const dateView = slice.timeframe
  const getPriceStyle = useGetPriceStyle()

  const currentDayString = useMemo(() => dayjs().format('YYYY-MM-DD'), [])

  const displayedJournalDates: Set<string> = new Set(Object.keys(props.journalRecordGroups))

  if (dateView.view === DateViewVariant.MONTHLY) {
    const startOfMonth: dayjs.Dayjs = dayjs(`${dateView.year}-${dateView.month}-01`)
    if (startOfMonth.isSame(currentDayString, 'month')) {
      displayedJournalDates.add(currentDayString)
    } else {
      displayedJournalDates.add(startOfMonth.format('YYYY-MM-DD'))
    }
  }

  return (
    <Table size="small" sx={{ overflowY: 'scroll' }}>
      {sortDatesChronologically(...displayedJournalDates).map((date: string) => {
        const entries = props.journalRecordGroups[date] ?? []
        const day = dayjs(date)
        const isToday = day.isSame(dayjs(), 'day')
        const showQuckEditor = isToday || !entries.length

        return (
          <TableBody key={date}>
            <TableRow
              dateRow
              sx={{
                verticalAlign: entries.length + (showQuckEditor ? 1 : 0) > 1 ? 'top' : undefined,
              }}>
              <TableCell rowSpan={entries.length + (showQuckEditor ? 2 : 1)}>
                <JournalEntryDate
                  day={day}
                  isToday={isToday}
                  onClick={() => {
                    openEntryEditModalForCreate({
                      date: day.format('YYYY-MM-DD'),
                    })
                  }}
                />
              </TableCell>
            </TableRow>

            {entries.map((entry: JournalEntry) => {
              const { sourceAccountId } = entry
              let destinationAccountId: string | undefined = undefined
              if (entry.transfer) {
                destinationAccountId = entry.transfer.destAccountId
              }
              const sourceAccount: Account | undefined = sourceAccountId
                ? getAccountsQuery.data[sourceAccountId]
                : undefined

              const destinationAccount: Account | undefined = destinationAccountId
                ? getAccountsQuery.data[destinationAccountId]
                : undefined

              const { categoryId } = entry
              const category: Category | undefined = categoryId ? getCategoriesQuery.data[categoryId] : undefined

              const netFigure: Figure | undefined = entry.$derived?.net?.['CAD']

              const hasTags = journalEntryHasTags(entry)
              const childHasTags = (entry as JournalEntry).children?.some((child) =>
                journalEntryHasTasks(child as JournalEntry),
              )

              // Reserved Tags
              const { parent: parentReservedTags, children: childReservedTags } = enumerateJournalEntryStatuses(entry)

              const isFlagged = parentReservedTags.has(StatusVariant.enum.FLAGGED)
              const isApproximate = parentReservedTags.has(StatusVariant.enum.APPROXIMATE)
              const isPending = parentReservedTags.has(StatusVariant.enum.PENDING)

              const childIsFlagged = childReservedTags.has(StatusVariant.enum.FLAGGED)
              const childIsApproximate = childReservedTags.has(StatusVariant.enum.APPROXIMATE)
              const childIsPending = childReservedTags.has(StatusVariant.enum.PENDING)

              const hasTasks = journalEntryHasTasks(entry)
              const tasks: EntryTask[] = entry.tasks ?? []
              const numCompletedTasks: number = hasTasks
                ? tasks.filter((task: EntryTask) => task.completedAt).length
                : 0
              const taskProgressString =
                Math.max(numCompletedTasks, tasks.length) > 9 ? '9+' : `${numCompletedTasks}/${tasks.length}`
              const taskProgressPercentage = Math.round(100 * (numCompletedTasks / Math.max(tasks.length, 1)))

              const rowIsSelected: boolean = journalEntrySelectionState[entry._id] ?? false
              return (
                <TableRow
                  key={entry._id}
                  onClick={(event) => props.onClickListItem(event, entry)}
                  onDoubleClick={(event) => props.onDoubleClickListItem(event, entry)}
                  selected={rowIsSelected}
                  sx={{ opacity: undefined, overflow: 'visible' }}>
                  <TableCell
                    selectCheckbox
                    sx={{
                      width: '0%',
                      position: 'relative',
                    }}>
                    <Checkbox
                      className="checkbox"
                      sx={{ m: -1 }}
                      checked={rowIsSelected}
                      onChange={() => toggleJournalEntrySelectionState(entry._id)}
                      onClick={(event) => event.stopPropagation()}
                    />
                    <AvatarIcon
                      className="icon"
                      avatar={category?.avatar}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ width: '20%' }}>
                    <Typography sx={{ ml: -0.5 }}>{entry.memo || PLACEHOLDER_UNNAMED_JOURNAL_ENTRY_MEMO}</Typography>
                  </TableCell>
                  <TableCell sx={{ width: '20%' }}>
                    {sourceAccount && <AvatarChip icon avatar={sourceAccount.avatar} label={sourceAccount.label} />}
                    {sourceAccount && destinationAccount && <Typography component="span">&rarr;</Typography>}
                    {destinationAccount && (
                      <AvatarChip icon avatar={destinationAccount.avatar} label={destinationAccount.label} />
                    )}
                    {hasTasks && taskProgressPercentage < 100 && (
                      <Stack alignItems="center" sx={{ my: -2 }}>
                        <CircularProgressWithLabel value={taskProgressPercentage}>
                          {taskProgressString}
                        </CircularProgressWithLabel>
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell sx={{ width: '0%' }}>
                    <Stack direction="row">
                      <Grow in={isFlagged || childIsFlagged}>
                        <Flag sx={{ display: 'block' }} />
                      </Grow>
                      <Grow in={hasTags || childHasTags}>
                        <LocalOffer sx={{ display: 'block' }} />
                      </Grow>
                      <Grow in={isApproximate || childIsApproximate}>
                        <Update sx={{ display: 'block' }} />
                      </Grow>
                      <Grow in={isPending || childIsPending}>
                        <Pending sx={{ display: 'block' }} />
                      </Grow>
                    </Stack>
                  </TableCell>
                  <TableCell align="right" sx={{ width: '10%' }}>
                    <Typography sx={{ ...getPriceStyle(netFigure?.amount ?? 0, isApproximate) }}>
                      {getFigureString(netFigure, { isApproximate })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {category ? (
                      <AvatarChip avatar={category.avatar} label={category.label} />
                    ) : (
                      <Chip
                        sx={(theme) => ({
                          backgroundColor: alpha(theme.palette.grey[400], 0.125),
                        })}
                        size="small"
                        label="Uncategorized"
                      />
                    )}
                  </TableCell>
                </TableRow>
              )
            })}

            {showQuckEditor && (
              <TableRow buttonRow>
                <TableCell colSpan="100%">
                  <QuickJournalEditor onAdd={isSmall ? () => { } : undefined} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        )
      })}
    </Table>
  )
}
