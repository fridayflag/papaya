import AvatarChip from '@/components/icon/AvatarChip'
import { JournalFilterContext } from '@/contexts/JournalFilterContext'
import { useCategories } from '@/hooks/queries/useCategories'
import { useGetPriceStyle } from '@/hooks/useGetPriceStyle'
import { Category } from '@/schema/documents/Category'
import { Figure } from '@/schema/new/legacy/Figure'
import { AmountRange, SearchFacetKey, SearchFacets } from '@/schema/support/search/facet'
import { enumerateFilters } from '@/utils/filtering'
import { parseJournalEntryAmount } from '@/utils/journal'
import { getFigureString } from '@/utils/string'
import { Add, MonetizationOn, Savings } from '@mui/icons-material'
import { Chip, Collapse, IconButton, Stack, Typography } from '@mui/material'
import { useContext, useRef, useState } from 'react'
import JournalFilterPicker from './JournalFilterPicker'

export default function JournalFilterRibbon() {
  const [showFiltersMenu, setShowFiltersMenu] = useState<boolean>(false)
  const filtersMenuButtonRef = useRef<HTMLButtonElement | null>(null)

  const journalFilterContext = useContext(JournalFilterContext)

  const getPriceStyle = useGetPriceStyle()

  const activeFilterSlots: Set<SearchFacetKey> = journalFilterContext?.activeJournalFilters
    ? enumerateFilters(journalFilterContext.activeJournalFilters)
    : new Set()

  const numFilters = activeFilterSlots.size

  const getCategoriesQuery = useCategories()
  const categoryIds = journalFilterContext?.activeJournalMemoryFilters?.CATEGORIES?.categoryIds

  const categories: Category[] = !categoryIds
    ? []
    : categoryIds
      .filter(Boolean)
      .map((categoryId) => getCategoriesQuery.data[categoryId])
      .filter(Boolean)

  const handleRemoveCategory = (categoryId: string) => {
    const newCategoryIds = (categoryIds ?? []).filter((id) => id !== categoryId)

    journalFilterContext?.updateJournalMemoryFilters((prev) => {
      const next = {
        ...prev,
        CATEGORIES: { categoryIds: newCategoryIds },
      }
      return next
    })
  }

  const handleRemoveMinimumAmount = () => {
    journalFilterContext?.updateJournalMemoryFilters((prev) => {
      const next: Partial<SearchFacets> = {
        ...prev,
        AMOUNT: prev.AMOUNT ? { ...prev.AMOUNT, gt: undefined } : undefined,
      }
      return next
    })
  }

  const handleRemoveMaximumAmount = () => {
    journalFilterContext?.updateJournalMemoryFilters((prev) => {
      const next: Partial<SearchFacets> = {
        ...prev,
        AMOUNT: prev.AMOUNT ? { ...prev.AMOUNT, lt: undefined } : undefined,
      }
      return next
    })
  }

  const amountRange: AmountRange | undefined = journalFilterContext?.activeJournalFilters.AMOUNT
  const parsedMinimumFigure: Figure | undefined =
    amountRange && amountRange.gt ? parseJournalEntryAmount(amountRange.gt) : undefined
  const parsedMaximumFigure: Figure | undefined =
    amountRange && amountRange.lt ? parseJournalEntryAmount(amountRange.lt) : undefined

  return (
    <>
      <JournalFilterPicker
        anchorEl={filtersMenuButtonRef.current}
        open={showFiltersMenu}
        onClose={() => setShowFiltersMenu(false)}
      />
      <Collapse in={numFilters > 0}>
        <Stack direction="row" sx={{ flexFlow: 'row wrap', px: 2, py: 1 }} gap={0.5}>
          {categories.map((category) => {
            return (
              <AvatarChip
                key={category._id}
                avatar={category.avatar}
                label={category.label}
                icon
                // contrast
                onDelete={() => handleRemoveCategory(category._id)}
              />
            )
          })}
          {parsedMinimumFigure && (
            <Chip
              icon={parsedMinimumFigure.amount > 0 ? <Savings fontSize="small" /> : <MonetizationOn fontSize="small" />}
              label={
                <Typography variant="inherit">
                  More than&nbsp;
                  <Typography
                    variant="inherit"
                    component="span"
                    sx={{ ...getPriceStyle(parsedMinimumFigure.amount), fontWeight: '600' }}>
                    {getFigureString(parsedMinimumFigure)}
                  </Typography>
                </Typography>
              }
              onDelete={() => handleRemoveMinimumAmount()}
            />
          )}
          {parsedMaximumFigure && (
            <Chip
              icon={parsedMaximumFigure.amount > 0 ? <Savings fontSize="small" /> : <MonetizationOn fontSize="small" />}
              label={
                <Typography variant="inherit">
                  Less than&nbsp;
                  <Typography
                    variant="inherit"
                    component="span"
                    sx={{ ...getPriceStyle(parsedMaximumFigure.amount), fontWeight: '600' }}>
                    {getFigureString(parsedMaximumFigure)}
                  </Typography>
                </Typography>
              }
              onDelete={() => handleRemoveMaximumAmount()}
            />
          )}

          <IconButton size="small" ref={filtersMenuButtonRef} onClick={() => setShowFiltersMenu((showing) => !showing)}>
            <Add fontSize="small" sx={(theme) => ({ color: theme.palette.text.secondary })} />
          </IconButton>
        </Stack>
      </Collapse>
    </>
  )
}
