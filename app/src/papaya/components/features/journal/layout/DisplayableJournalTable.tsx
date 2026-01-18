import { useActiveJournalView } from '@/hooks/queries';
import { DisplayableJournalEntry, JournalSlice } from '@/schema/aggregate-schemas';
import { getFigureString } from '@/utils/string';
import {
  Typography
} from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { useMemo } from 'react';


interface DisplayableJournalTableProps {
  slice: JournalSlice;
  onSelectForEdit: (displayableEntryId: string) => void;
}

const columns: GridColDef[] = [
  { field: 'date', headerName: 'Date', width: 100 },
  { field: 'memo', headerName: 'Memo', width: 100 },
  { field: 'amount', headerName: 'Amount', width: 100 },
]

export default function DisplayableJournalTable(props: DisplayableJournalTableProps) {

  const viewQuery = useActiveJournalView(props.slice);

  const flattenedDisplayableEntries = useMemo((): DisplayableJournalEntry[] => {
    return viewQuery.data?.aggregate.groups.flatMap((group) => group.entries) ?? [];
  }, [viewQuery.data]);

  const rows: GridRowsProp = useMemo((): GridRowsProp => {
    console.log(flattenedDisplayableEntries);
    return flattenedDisplayableEntries.map((entry) => ({
      id: entry.displayableEntryId,
      date: entry.date,
      memo: entry.memo,
      amount: getFigureString(entry.netAmount),
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
        props.onSelectForEdit(String(params.id));
      }}
    />
  )
}
