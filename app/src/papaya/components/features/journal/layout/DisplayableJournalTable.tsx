import { JournalEntryEditorContext } from '@/contexts/JournalEntryEditorContext';
import { useActiveJournalView } from '@/hooks/queries';
import { DisplayableJournalEntry, JournalSlice } from '@/schema/aggregate-schemas';
import { MonetaryEnumeration } from '@/schema/journal/money';
import { EntryUrn } from '@/schema/support/urn';
import { getMonetaryEnumerationString } from '@/utils/string';
import { Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { useContext, useMemo } from 'react';


interface DisplayableJournalTableProps {
  slice: JournalSlice;
  onSelectForEdit: (entryUrn: EntryUrn) => void;
}

const columns: GridColDef[] = [
  { field: 'date', headerName: 'Date', width: 100 },
  { field: 'memo', headerName: 'Memo', width: 100 },
  {
    field: 'sum',
    headerName: 'Amount',
    width: 100,
    // TODO strong typing
    valueFormatter: (value: unknown) => {
      return getMonetaryEnumerationString(value as MonetaryEnumeration)
    }
  },
]

export default function DisplayableJournalTable(props: DisplayableJournalTableProps) {
  const editorContext = useContext(JournalEntryEditorContext);
  const viewQuery = useActiveJournalView(props.slice);

  const flattenedDisplayableEntries = useMemo((): DisplayableJournalEntry[] => {
    return viewQuery.data?.aggregate.groups.flatMap((group) => group.entries) ?? [];
  }, [viewQuery.data]);

  const rows: GridRowsProp = useMemo((): GridRowsProp => {
    const editingEntryUrn = editorContext?.editingEntry?.urn ?? null;
    const liveDisplayable = editorContext?.displayableEditingEntry ?? null;

    return flattenedDisplayableEntries.map((entry: DisplayableJournalEntry) => {
      const isEditing = editingEntryUrn != null && entry.entryUrn === editingEntryUrn;
      const displayable = isEditing && liveDisplayable ? liveDisplayable : entry;
      return {
        id: displayable.entryUrn,
        date: displayable.aggregate.date,
        memo: displayable.aggregate.memo,
        sum: displayable.aggregate.sum,
      };
    });
  }, [flattenedDisplayableEntries, editorContext?.editingEntry?.urn, editorContext?.displayableEditingEntry]);

  if (viewQuery.isLoading) {
    return <Typography variant="body1">Loading table...</Typography>
  }

  return (
    <DataGrid
      editMode="row"
      rows={rows}
      columns={columns}
      onRowClick={(params) => {
        props.onSelectForEdit(params.id as EntryUrn);
      }}
    />
  )
}
