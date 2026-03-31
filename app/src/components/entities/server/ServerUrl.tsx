import { FileCopy } from '@mui/icons-material'
import { IconButton, TextField } from '@mui/material'

export const ServerUrl = (props: { serverUrl: string }) => {
  return (
    <TextField
      disabled
      // label='Your Server URL'
      size="small"
      value={props.serverUrl}
      variant="outlined"
      slotProps={{
        input: {
          endAdornment: (
            <IconButton
              size="small"
              onClick={() => {
                if (typeof window === 'undefined') {
                  return
                }
                window?.navigator?.clipboard.writeText(props.serverUrl)
              }}>
              <FileCopy />
            </IconButton>
          ),
        },
      }}
    />
  )
}
