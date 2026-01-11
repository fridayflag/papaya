import { DatePicker, LocalizationProvider, PickersTextFieldProps, type DatePickerProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

type DateFieldProps = DatePickerProps;

export default function DateField(props: DateFieldProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        {...props}
        format="ddd, MMM D"
        label="Date"
        slotProps={{
          textField: {
            variant: 'outlined',
            ...props.slotProps?.textField,
          } as PickersTextFieldProps,
        }}
      />
    </LocalizationProvider>
  )
}
