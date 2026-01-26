import { useActiveJournalView } from '@/hooks/queries';
import { useDebug } from '@/hooks/useDebug';
import { DisplayableJournalEntry, JournalSlice } from '@/schema/aggregate-schemas';
import { MonetaryEnumeration } from '@/schema/journal/money';
import { EntryUrn } from '@/schema/support/urn';
import { getMonetaryEnumerationString } from '@/utils/string';
import {
  Typography
} from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { useMemo } from 'react';


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

  const { allDbRecordsQuery } = useDebug();
  console.log('allDbRecordsQuery:', allDbRecordsQuery.data);

  const viewQuery = useActiveJournalView(props.slice);

  const flattenedDisplayableEntries = useMemo((): DisplayableJournalEntry[] => {
    return viewQuery.data?.aggregate.groups.flatMap((group) => group.entries) ?? [];
  }, [viewQuery.data]);

  const rows: GridRowsProp = useMemo((): GridRowsProp => {
    return flattenedDisplayableEntries.map((entry: DisplayableJournalEntry) => ({
      id: entry.entryUrn,
      date: entry.aggregate.date,
      memo: entry.aggregate.memo,
      sum: entry.aggregate.sum,
    }));
  }, [flattenedDisplayableEntries]);

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
