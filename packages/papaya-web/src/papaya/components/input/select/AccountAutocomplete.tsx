import { Autocomplete, AutocompleteProps, ListItem, ListItemIcon, ListItemText, TextField } from '@mui/material'

import { useAccounts } from '@/hooks/queries/useAccounts'
import PictogramIcon from '../display/PictogramIcon'

export type AccountAutocompleteProps = Partial<Omit<AutocompleteProps<string, false, false, false>, 'options'>>

export default function AccountAutocomplete(props: AccountAutocompleteProps) {
  const { loading, ...rest } = props

  const getAccountsQuery = useAccounts()
  const accounts = getAccountsQuery.data
  const { isLoading } = getAccountsQuery

  return (
    <Autocomplete
      loading={isLoading || loading}
      options={Object.keys(accounts)}
      renderInput={(params) => <TextField {...params} label={'Account'} />}
      getOptionLabel={(option) => accounts[option]?.label}
      getOptionKey={(option) => option}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props
        const account = accounts[option]

        return (
          <ListItem dense key={key} {...optionProps}>
            <ListItemIcon>
              <PictogramIcon avatar={account?.avatar} />
            </ListItemIcon>
            <ListItemText primary={account?.label} />
          </ListItem>
        )
      }}
      {...rest}
    />
  )
}
