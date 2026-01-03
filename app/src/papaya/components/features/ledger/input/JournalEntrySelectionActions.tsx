import { useFilteredJournalEntries } from '@/hooks/queries/useFilteredJournalEntries'
import { JournalEntry } from '@/schema/documents/JournalEntry'
import { Currency } from '@/schema/support/currency'
import {
  useJournalEntrySelectionState,
  useSetJournalEntrySelectionState,
} from '@/store/app/useJournalEntrySelectionState'
import {
  ArrowDropDown,
  CheckBox,
  CheckBoxOutlineBlank,
  Delete,
  IndeterminateCheckBox,
  MoreVert,
} from '@mui/icons-material'
import { Button, Fade, IconButton, ListItemText, Menu, MenuItem, Stack } from '@mui/material'
import { useContext, useRef, useState } from 'react'

export enum SelectAllAction {
  TOGGLE = 'TOGGLE',
  ALL = 'ALL',
  NONE = 'NONE',
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

const selectAllMenuOptionLabels: Omit<Record<SelectAllAction, string>, 'TOGGLE'> = {
  [SelectAllAction.ALL]: 'All',
  [SelectAllAction.NONE]: 'None',
  [SelectAllAction.CREDIT]: 'Credits',
  [SelectAllAction.DEBIT]: 'Debits',
}

export default function JournalEntrySelectionActions() {
  const [showSelectAllMenu, setShowSelectAllMenu] = useState<boolean>(false)

  const selectAllMenuButtonRef = useRef<HTMLButtonElement | null>(null)

  const selectedRows = useJournalEntrySelectionState()

  const setSelectedRows = useSetJournalEntrySelectionState()

  const getFilterJournalEntriesQuery = useFilteredJournalEntries()

  const journalEntries: JournalEntry[] = Object.values(getFilterJournalEntriesQuery.data)
  const numTotalRows = journalEntries.length

  const selectedRowIds = Object.entries(selectedRows)
    .filter(([, value]) => value)
    .map(([key]) => key)

  const hasSelectedAll = journalEntries.every((entry) => selectedRows[entry._id])

  const numSelectedRows = selectedRowIds.length
  const hideSelectedRowsOptions = numSelectedRows <= 0

  const handleSelectAllAction = (action: SelectAllAction) => {
    setShowSelectAllMenu(false)

    // Calculate net amount for an entry by looking at the first currency in the net figures
    const calculateNetAmount = (entry: JournalEntry): number => {
      if (!entry.$derived?.net) return 0

      // Get the first currency's figure (usually there's only one)
      const currencies = Object.keys(entry.$derived.net) as Currency[]
      if (currencies.length === 0) return 0

      const figure = entry.$derived.net[currencies[0]]
      return figure ? figure.amount : 0
    }

    const newSelectedRows = (() => {
      let selected: Set<string>
      const allRowIds = new Set<string>(Object.keys(getFilterJournalEntriesQuery.data ?? {}))
      const emptySet = new Set<string>([])
      const hasSelectedAll =
        Object.keys(selectedRows).length > 0 &&
        allRowIds.size > 0 &&
        Array.from(allRowIds).every((id) => selectedRows[id])

      switch (action) {
        case SelectAllAction.ALL:
          selected = allRowIds
          break

        case SelectAllAction.NONE:
          selected = emptySet
          break

        case SelectAllAction.CREDIT:
          selected = new Set<string>(
            Array.from(allRowIds).filter((id: string) => {
              const entry = getFilterJournalEntriesQuery.data[id]
              return entry ? calculateNetAmount(entry) > 0 : false
            }),
          )
          break

        case SelectAllAction.DEBIT:
          selected = new Set<string>(
            Array.from(allRowIds).filter((id: string) => {
              const entry = getFilterJournalEntriesQuery.data[id]
              return entry ? calculateNetAmount(entry) < 0 : false
            }),
          )
          break

        case SelectAllAction.TOGGLE:
        default:
          selected = hasSelectedAll ? emptySet : allRowIds
      }

      return Object.fromEntries(
        Array.from(new Set([...Object.keys(selectedRows), ...selected])).map((key) => {
          return [key, selected.has(key)]
        }),
      )
    })()

    setSelectedRows(newSelectedRows)
  }

  return (
    <>
      <Menu
        open={showSelectAllMenu}
        anchorEl={selectAllMenuButtonRef.current}
        onClose={() => setShowSelectAllMenu(false)}>
        {Object.entries(selectAllMenuOptionLabels).map(([key, label]) => {
          return (
            <MenuItem
              key={key}
              onClick={() => handleSelectAllAction(key as SelectAllAction)}
              aria-label={`Select ${label}`}>
              <ListItemText>{label}</ListItemText>
            </MenuItem>
          )
        })}
      </Menu>
      <Stack direction="row" alignItems="center" gap={0}>
        <Stack direction="row">
          <Button
            sx={{ minWidth: 'unset', pr: 0.5, ml: -1 }}
            color="inherit"
            onClick={() => handleSelectAllAction(SelectAllAction.TOGGLE)}
            ref={selectAllMenuButtonRef}
            disabled={numTotalRows === 0}>
            {hasSelectedAll && numTotalRows > 0 ? (
              <CheckBox color="primary" />
            ) : (
              <>
                {numSelectedRows > 0 ? (
                  <IndeterminateCheckBox color="inherit" />
                ) : (
                  <CheckBoxOutlineBlank color="inherit" />
                )}
              </>
            )}
          </Button>
          <Button
            color="inherit"
            onClick={() => setShowSelectAllMenu(true)}
            sx={{
              minWidth: 'unset',
              px: 0,
              ml: -0.5,
            }}
            disabled={numTotalRows === 0}>
            <ArrowDropDown />
          </Button>
        </Stack>
        {!hideSelectedRowsOptions && (
          <Fade in>
            <Stack direction="row" alignItems="center">
              <IconButton>
                <Delete fontSize="small" />
              </IconButton>
            </Stack>
          </Fade>
        )}
        <IconButton>
          <MoreVert fontSize="small" />
        </IconButton>
      </Stack>
    </>
  )
}
