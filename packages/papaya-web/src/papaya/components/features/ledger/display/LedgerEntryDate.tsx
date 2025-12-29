import { Avatar, Button, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'

interface LedgerEntryDateProps {
  day: dayjs.Dayjs
  isToday: boolean
  onClick?: () => void
}


const LedgerEntryDate = (props: LedgerEntryDateProps) => {
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
