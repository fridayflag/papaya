import { InputAdornment, TextField, TextFieldProps } from "@mui/material";


export default function TopicField(props: TextFieldProps) {
  return (
    <TextField
      label="Topic"
      placeholder="topic"
      fullWidth
      {...props}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">#</InputAdornment>
          ),
          ...props.slotProps?.input,
        },
        ...props.slotProps,
      }}
    />
  )
}
