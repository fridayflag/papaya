import { PropsWithChildren } from 'react'

import { Close } from '@mui/icons-material'
import { alpha, Box, Container, IconButton, Paper, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'

type AuthFlowModalProps = PropsWithChildren<{
  title: string
  description: string
}>

export default function AuthFlowModal(props: AuthFlowModalProps) {
  return (
    <Paper
      square
      sx={(theme) => ({
        minWidth: '100dvw',
        minHeight: '100dvh',
        background: theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.1) : undefined,
        // background: alpha(theme.palette.primary.main, 0.1),
      })}>
      <Stack sx={{ minHeight: '100dvh' }} justifyContent={'center'}>
        <Container maxWidth="lg" disableGutters sx={{ px: { md: 16, sm: 8, xs: 2 } }}>
          <Paper variant="outlined" sx={{ borderRadius: 6, p: 6 }}>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={(theme) => ({ color: theme.palette.primary.main })}>
                  <svg
                    fill="currentColor"
                    style={{ height: '42px', width: 'auto' }}
                    xmlns="http://www.w3.org/2000/svg"
                    width="163.64"
                    height="233.89"
                    viewBox="0 0 163.64 233.89">
                    <defs></defs>
                    <g id="Layer_1-2">
                      <path
                        className="cls-1"
                        d="M159.18,137.47c-3.54-6.37-10.42-11.28-19.97-14.26,6.97-6.01,12.53-12.83,16.52-20.25,4.9-9.07,7.46-19.03,7.46-29.43,0-26.74-9.94-46.57-29.55-58.94C118.06,4.77,96.85,0,68.82,0,44.86,0,22.06,6.94,4.61,19.53L.05,22.82v101.42l4.56,3.29c11.03,7.96,24.19,13.66,38.43,16.77-13.98,9.94-25.48,21.67-33.1,33.9-11.09,17.81-12.97,34.96-5.28,48.28.56.97,1.18,1.93,1.84,2.85l3.3,4.56h86.28l2.28-1.11c3.3-1.61,6.62-3.37,9.86-5.24,19.59-11.31,35.75-26.18,45.49-41.87,10.99-17.69,12.93-34.8,5.47-48.2ZM22.05,112.72V34.34c13.08-7.99,29.47-12.34,46.77-12.34,23.43,0,41.29,3.77,53.09,11.21,12.97,8.18,19.28,21.37,19.28,40.32-.01,22.5-19.29,41.21-46.99,48.39-.03,0-.06,0-.09.02-2.21.57-4.48,1.07-6.79,1.48-5.89,1.07-12.08,1.64-18.5,1.64-17.3,0-33.69-4.35-46.77-12.34ZM97.22,208.49c-2.06,1.19-4.16,2.33-6.27,3.4H22.37c-2.86-13.79,13.77-39,44.17-56.56,8.51-4.91,17.29-8.31,25.75-10.46,2.2-.57,4.38-1.04,6.53-1.44,12.68-2.34,24.25-1.89,32.57.41,5.93,1.63,8.23,3.73,8.57,4.33,1.12,2.01,1.67,4.4,1.67,7.07,0,14.28-15.73,36.69-44.41,53.25Z"
                      />
                    </g>
                  </svg>
                </Box>
                <IconButton>
                  <Close />
                </IconButton>
              </Stack>
              <Grid container columns={2} spacing={4}>
                <Grid size={{ xs: 2, md: 1 }}>
                  <Typography variant="h4" mb={1}>
                    {props.title}
                  </Typography>
                  <Typography>{props.description}</Typography>
                </Grid>
                <Grid size={{ xs: 2, md: 1 }}>{props.children}</Grid>
              </Grid>
            </Stack>
          </Paper>
        </Container>
      </Stack>
    </Paper>
  )
}
