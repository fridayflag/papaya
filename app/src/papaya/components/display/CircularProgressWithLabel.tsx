import { Box, CircularProgress, circularProgressClasses, CircularProgressProps, Typography } from '@mui/material'
import { PropsWithChildren } from 'react'

export default function CircularProgressWithLabel(props: PropsWithChildren<CircularProgressProps>) {
  const { children, ...rest } = props

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        sx={(theme) => ({
          color: theme.palette.grey[200],
          ...theme.applyStyles('dark', {
            color: theme.palette.grey[800],
          }),
        })}
        size={32}
        thickness={4}
        {...rest}
        value={100}
      />
      <CircularProgress
        variant="determinate"
        disableShrink
        sx={(theme) => ({
          color: '#1a90ff',
          animationDuration: '550ms',
          position: 'absolute',
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: 'round',
          },
          ...(props.value && props.value >= 100
            ? {
                color: theme.palette.success.main,
              }
            : {
                ...theme.applyStyles('dark', {
                  color: '#308fe8',
                }),
              }),
        })}
        size={32}
        thickness={4}
        {...rest}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Typography variant="overline" component="div" sx={{ color: 'text.secondary' }}>
          {children}
        </Typography>
      </Box>
    </Box>
  )
}
