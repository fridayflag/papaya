import { Container } from '@mui/material'
import { PropsWithChildren } from 'react'

export default function LayoutContainer(props: PropsWithChildren) {
  return (
    <Container
      maxWidth={undefined}
      disableGutters
      sx={{
        flex: 1, // Ensure container takes remaining space
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {props.children}
    </Container>
  )
}
