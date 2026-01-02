import { Pictogram } from '@/schema/journal/resource/display'
import { alpha, Chip, Icon, useTheme } from '@mui/material'
import { ReactElement } from 'react'
import PictogramIcon from './PictogramIcon'

interface PictogramChipProps {
  pictogram?: Pictogram
  label?: string
  contrast?: boolean
  icon?: boolean
  onDelete?: () => void
  deleteIcon?: ReactElement
}

export default function PictogramChip(props: PictogramChipProps) {
  const categoryColor = props.pictogram?.primaryColor
  const theme = useTheme()

  let background = undefined
  let color = undefined
  if (categoryColor) {
    if (props.contrast) {
      background = categoryColor
      // use contrast color
      color = theme.palette.getContrastText(categoryColor)
    } else {
      background = alpha(categoryColor, 0.125)
      color = categoryColor
    }
  }

  return (
    <Chip
      size={props.icon ? undefined : 'small'}
      sx={{
        color,
        background,
        fontWeight: 500,
      }}
      label={props.label}
      icon={
        props.icon && props.pictogram ? (
          <Icon>
            <PictogramIcon pictogram={props.pictogram} sx={{ color: `${color} !important` }} />
          </Icon>
        ) : undefined
      }
      onDelete={props.onDelete}
      deleteIcon={props.deleteIcon}
    />
  )
}
