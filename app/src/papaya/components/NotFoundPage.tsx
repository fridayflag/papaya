import AppLogo from '@/components/nav/header/AppLogo'
import { Button, Stack, Typography } from '@mui/material'
import { Link } from '@tanstack/react-router'

export default function NotFoundPage() {
  return (
    <Stack
      component="main"
      sx={{
        height: '100dvh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        gridTemplateColumns: '1fr',
        p: 4,
        gap: 4,
      }}
    >
      <Stack direction="row" alignItems="center">
        <AppLogo />
      </Stack>
      <Stack
        flex={1}
        alignItems="center"
        justifyContent="center"
        gap={2}
        sx={{ textAlign: 'center' }}
      >
        <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 700, lineHeight: 1 }}>
          404
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Page not found
        </Typography>
        <Button component={Link} to="/" variant="contained" size="large">
          Go home
        </Button>
      </Stack>
    </Stack>
  )
}
