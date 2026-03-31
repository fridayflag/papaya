import { Container, ContainerProps } from '@mui/material'
import { PropsWithChildren } from 'react'

type IBaseContainerProps = PropsWithChildren<ContainerProps>

/**
 * Base container, used to wrap page components. Notably, this component
 * enforces the max-width for all content in the app.
 */
export default function BaseContainer(props: IBaseContainerProps) {
  const { children, sx, ...rest } = props

  return (
    <Container
      {...rest}
      maxWidth="xl"
      disableGutters
      sx={{
        px: {
          xs: 1,
          sm: 4,
          md: 6,
        },
        ...sx,
      }}>
      {children}
    </Container>
  )
}
