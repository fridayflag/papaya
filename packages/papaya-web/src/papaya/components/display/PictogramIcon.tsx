import { Pictogram, PictogramVariant } from '@/schema/journal/resource/display'
import { Icon, SxProps, Theme } from '@mui/material'
import { ImagePictogram } from '../input/picker/ImagePictogramPicker'
import { DEFAULT_PICTOGRAM } from '../input/picker/PictogramPicker'

interface PictogramIconProps {
  pictogram?: Pictogram
  compact?: boolean
  sx?: SxProps<Theme>
  className?: string
}

export default function PictogramIcon(props: PictogramIconProps) {
  const pictogram: Pictogram = props.pictogram ?? { ...DEFAULT_PICTOGRAM }
  switch (pictogram.variant) {
    case PictogramVariant.enum.PICTORIAL:
      return (
        <Icon
          className={props.className}
          fontSize="small"
          style={{ display: 'block' }}
          sx={{ color: pictogram.primaryColor, ...props.sx }}>
          {pictogram.content}
        </Icon>
      )
    case PictogramVariant.enum.IMAGE:
      return (
        <ImagePictogram className={props.className} pictogram={pictogram} sx={{ width: '28px', height: '28px', ...props.sx }} />
      )
    default:
      return null
  }
}
