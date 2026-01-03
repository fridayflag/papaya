import { SxProps, useTheme } from '@mui/material'

type GetPriceStyle = (amount: number, approximate?: boolean) => SxProps

export const useGetPriceStyle = (): GetPriceStyle => {
  const theme = useTheme()

  return (netAmount: number, approximate: boolean = false): SxProps => {
    let color = undefined
    const textDecoration = undefined

    if (approximate) {
      color = theme.palette.warning.main
    } else if (netAmount > 0) {
      color = theme.palette.success.main
    } else if (netAmount === 0) {
      color = theme.palette.text.secondary
      // textDecoration = 'line-through'
    }

    return { color, textDecoration }
  }
}
