import { Autocomplete, AutocompleteProps, ListItem, ListItemIcon, ListItemText, TextField } from '@mui/material'

import { useCategories } from '@/hooks/queries/useCategories'
import PictogramIcon from '../../display/PictogramIcon'

export type CategoryAutocompleteProps = Partial<Omit<AutocompleteProps<string, true, false, false>, 'options'>>

export default function CategoryAutocomplete(props: CategoryAutocompleteProps) {
  const { loading, ...rest } = props

  const getCategoriesQuery = useCategories()
  const categories = getCategoriesQuery.data
  const { isLoading } = getCategoriesQuery

  return (
    <Autocomplete
      loading={isLoading || loading}
      options={Object.keys(categories)}
      renderInput={(params) => <TextField {...params} label={'Category'} />}
      getOptionLabel={(option) => categories[option]?.label}
      getOptionKey={(option) => option}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props
        const category = categories[option]

        return (
          <ListItem dense key={key} {...optionProps}>
            <ListItemIcon>
              <PictogramIcon avatar={category?.avatar} />
            </ListItemIcon>
            <ListItemText primary={category?.label} />
          </ListItem>
        )
      }}
      {...rest}
      multiple
    />
  )
}
