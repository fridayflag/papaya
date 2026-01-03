import { AmountRange, SearchFacetKey, SearchFacets } from '@/schema/support/search/facet'
import { parseJournalEntryAmount } from './journal'
import { JournalEntry } from '@/schema/documents/JournalEntry'
import { DownstreamQueryFilter, FacetedSearchDownstreamFilters } from '@/schema/support/search/filter'

export type FilterPair<K extends SearchFacetKey> = [K, SearchFacets[K]]

export function enumerateFilters(searchFacets: Partial<SearchFacets>): Set<SearchFacetKey>
export function enumerateFilters(
  searchFacets: Partial<SearchFacets>,
  returnPairs: true,
): Array<FilterPair<SearchFacetKey>>
export function enumerateFilters(
  searchFacets: Partial<SearchFacets>,
  returnPairs?: boolean,
): Set<SearchFacetKey> | Array<FilterPair<SearchFacetKey>> {
  const {
    AMOUNT,
    CATEGORIES,
    TAGS,
    // ATTACHMENTS,
  } = searchFacets

  const slots: Set<SearchFacetKey> = new Set<SearchFacetKey>([])
  const pairs: Array<FilterPair<SearchFacetKey>> = []

  // CATEGORIES facet
  if (CATEGORIES && CATEGORIES.categoryIds.length > 0) {
    slots.add(SearchFacetKey.CATEGORIES)
    if (returnPairs) {
      pairs.push([SearchFacetKey.CATEGORIES, CATEGORIES])
    }
  }

  // AMOUNT facet
  if (AMOUNT) {
    if (
      parseJournalEntryAmount(AMOUNT?.gt ?? '') !== undefined ||
      parseJournalEntryAmount(AMOUNT?.lt ?? '') !== undefined
    ) {
      slots.add(SearchFacetKey.AMOUNT)
      if (returnPairs) {
        pairs.push([SearchFacetKey.AMOUNT, AMOUNT])
      }
    }
  }

  // TAGS facet
  if (TAGS && (TAGS.tagIds.length > 0 || (TAGS.statusIds && TAGS.statusIds.length > 0))) {
    slots.add(SearchFacetKey.TAGS)
    if (returnPairs) {
      pairs.push([SearchFacetKey.TAGS, TAGS])
    }
  }

  // // ATTACHMENTS facet
  // if (ATTACHMENTS && ATTACHMENTS.hasAttachments) {
  //     slots.add(SearchFacetKey.ATTACHMENTS);
  //     if (returnPairs) {
  //         pairs.push([SearchFacetKey.ATTACHMENTS, ATTACHMENTS]);
  //     }
  // }

  return returnPairs ? pairs : slots
}

export const transformAmountRange = (
  amountRange: AmountRange,
): { greaterThan: number | undefined; lessThan: number | undefined } => {
  const lt: number | undefined = parseJournalEntryAmount(amountRange.lt ?? '')?.amount
  const gt: number | undefined = parseJournalEntryAmount(amountRange.gt ?? '')?.amount

  const greaterThan: number[] = []
  const lessThan: number[] = []

  if (gt !== undefined) {
    if (gt <= 0) {
      // "More than $X" where X is an expense
      lessThan.push(gt)
    } else {
      // "More than $X" where X is an income
      greaterThan.push(gt)
    }
  }
  if (lt !== undefined) {
    if (lt <= 0) {
      // "Less than $X" where X is an expense
      greaterThan.push(lt)
      lessThan.push(0)
    } else {
      // "Less than $X" where X is an income
      lessThan.push(lt)
      if (!greaterThan.length) {
        greaterThan.push(0)
      }
    }
  }

  return {
    greaterThan: greaterThan.length > 0 ? Math.max(...greaterThan) : undefined,
    lessThan: lessThan.length > 0 ? Math.min(...lessThan) : undefined,
  }
}

export const getJournalEntriesByDownstreamFilters = async (
  journalEntries: JournalEntry[],
  downstreamFilters: Partial<SearchFacets>,
): Promise<JournalEntry[]> => {
  return Promise.resolve(
    (Object.entries(FacetedSearchDownstreamFilters) as Array<[keyof SearchFacets, DownstreamQueryFilter<any>]>).reduce(
      (acc: JournalEntry[], [facetKey, downstreamQueryFilter]) => {
        if (!downstreamQueryFilter) {
          return acc
        }

        const filterValue = downstreamFilters[facetKey]
        if (filterValue === undefined) {
          return acc
        }

        type FilterType = Parameters<NonNullable<typeof downstreamQueryFilter>>[0]
        const result = downstreamQueryFilter(filterValue as FilterType, acc)
        return result ?? acc
      },
      journalEntries,
    ),
  )
}
