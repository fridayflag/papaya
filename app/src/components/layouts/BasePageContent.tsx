import { Stack, Typography } from '@mui/material'
import { PropsWithChildren } from 'react'

type IBasePageContentProps = PropsWithChildren<{
  pageTitle: string
  pageDescription: string
}>

/**
 * A base page component, which provides props for adding a title and
 * description to a page.
 */
export default function BasePageContent(props: IBasePageContentProps) {
  return (
    <Stack flex={1}>
      <Stack mb={2} direction="row" gap={1} justifyContent="space-between">
        <Typography variant="h2">{props.pageTitle}</Typography>
      </Stack>
      <Typography>{props.pageDescription}</Typography>
      <Stack flex={1} mt={3}>
        {props.children}
      </Stack>
    </Stack>
  )
}
