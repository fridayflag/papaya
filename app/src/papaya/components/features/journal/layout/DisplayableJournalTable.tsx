import { JournalContext } from '@/contexts/JournalContext'
import { useJournalView } from '@/hooks/queries'
import { JournalSlice } from '@/schema/journal/aggregate'
import { Figure } from '@/schema/journal/entity/figure'
import {
  Typography
} from '@mui/material'
import { useContext } from 'react'


interface DisplayableJournalTableProps {
  slice: JournalSlice;
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
  const journalContext = useContext(JournalContext)

  const viewQuery = useJournalView(journalContext.activeJournalId, props.slice);

  if (viewQuery.isLoading) {
    return <Typography variant="body1">Loading table...</Typography>
  }

  return (
    <div>
      {JSON.stringify(viewQuery.data)}
    </div>
  )
}
