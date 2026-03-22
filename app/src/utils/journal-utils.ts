
import { DEFAULT_PICTOGRAM } from '@/components/input/picker/PictogramPicker'
import { Pictogram } from '@/schema/etc-schemas'


export const generateRandomPictogram = (): Pictogram => {
  const primaryColor = `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`
  return {
    ...DEFAULT_PICTOGRAM,
    primaryColor,
  }
}
