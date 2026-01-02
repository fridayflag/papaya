import { Popover, TextField } from '@mui/material'
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useState } from 'react'

export default function CustomDatePicker() {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TextField
        autoComplete="off"
        label="Date"
        fullWidth
        onClick={(event) => setAnchorEl(event.currentTarget)}
        // onBlur={() => setAnchorEl(null)}
      />

      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        disableAutoFocus
        disableEnforceFocus
        // disablePortal
        disableScrollLock
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}>
        <DateCalendar
          slotProps={{
            day: {
              onClick: (event) => {
                event.stopPropagation()
                event.preventDefault()
              },
            },
          }}
        />
      </Popover>

      {/* <DatePicker
                format='dddd, MMMM D'
                label='Date'
            /> */}
    </LocalizationProvider>
  )
}
