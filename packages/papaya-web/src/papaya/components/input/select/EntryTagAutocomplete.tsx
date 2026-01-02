import { PapayaEntryStatus } from '@/constants/status'
import { useEntryTags } from '@/hooks/queries/useEntryTags'
import { EntryTag } from '@/schema/documents/EntryTag'
import { EntryStatus } from '@/schema/models/EntryStatus'
import { Close, Done } from '@mui/icons-material'
import { Autocomplete, AutocompleteProps, ListItem, ListItemText, TextField } from '@mui/material'

export type EntryTagAutocompleteProps = Partial<Omit<AutocompleteProps<string, true, false, false>, 'options'>>

export default function EntryTagAutocomplete(props: EntryTagAutocompleteProps) {
  const { loading, ...rest } = props

  const getEntryTagsQuery = useEntryTags()
  const entryTags = getEntryTagsQuery.data

  const { isLoading } = getEntryTagsQuery

  const tags: Record<string, EntryTag | EntryStatus> = {
    ...Object.fromEntries(
      PapayaEntryStatus.filter((status) => !status.archived || props.value?.includes(status._id)).map((status) => [
        status._id,
        status,
      ]),
    ),
    ...entryTags,
  }

  return (
    <Autocomplete
      loading={isLoading || loading}
      options={Object.keys(tags)}
      renderInput={(params) => <TextField {...params} label={'Tag'} />}
      getOptionLabel={(option) => tags[option]?.label}
      getOptionKey={(option) => option}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props
        const entryTag: EntryTag | EntryStatus | undefined = tags[option]

        return (
          <ListItem key={key} {...optionProps}>
            <Done
              sx={(theme) => ({
                width: 17,
                height: 17,
                mr: theme.spacing(1),
                visibility: selected ? 'visible' : 'hidden',
              })}
            />
            <ListItemText primary={entryTag?.label} secondary={entryTag?.description} />
            <Close
              sx={{
                opacity: 0.6,
                width: 18,
                height: 18,
                visibility: selected ? 'visible' : 'hidden',
              }}
            />
          </ListItem>
        )
      }}
      {...rest}
      multiple
    />
  )
}
