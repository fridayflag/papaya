import { Account } from '@/schema/documents/Account'
import { Category } from '@/schema/documents/Category'
import { EntryArtifact } from '@/schema/documents/EntryArtifact'
import { EntryTag } from '@/schema/documents/EntryTag'
import { Journal } from '@/schema/documents/Journal'
import { JournalEntry } from '@/schema/documents/JournalEntry'
import { PapayaMeta } from '@/schema/new/legacy/PapayaMeta'
import { SearchFacets } from '@/schema/support/search/facet'
import { FacetedSearchUpstreamFilters } from '@/schema/support/search/filter'
import { makeDefaultPapayaMeta } from '@/utils/database'
import { getDatabaseClient } from './client'

const db = getDatabaseClient()

export const ARBITRARY_MAX_FIND_LIMIT = 10000 as const

export const getCategories = async (journalId: string): Promise<Record<string, Category>> => {
  const result = await db.find({
    selector: {
      $and: [{ kind: 'papaya:category' }, { journalId }],
    },
    limit: ARBITRARY_MAX_FIND_LIMIT,
  })

  return Object.fromEntries((result.docs as Category[]).map((category) => [category._id, category]))
}

export const getAccounts = async (journalId: string): Promise<Record<string, Account>> => {
  const result = await db.find({
    selector: {
      $and: [{ kind: 'papaya:account' }, { journalId }],
    },
    limit: ARBITRARY_MAX_FIND_LIMIT,
  })

  return Object.fromEntries((result.docs as Account[]).map((account) => [account._id, account]))
}

export const getJournalEntriesByUpstreamFilters = async (
  journalId: string,
  facets: Partial<SearchFacets>,
): Promise<JournalEntry[]> => {
  const selectorClauses: any[] = [{ kind: 'papaya:entry' }, { journalId }]

  Object.entries(facets)
    .filter(([, props]) => Boolean(props))
    .forEach(([key, props]) => {
      const facetKey = key as keyof SearchFacets
      const filter = FacetedSearchUpstreamFilters[facetKey]
      if (!filter) {
        return
      }
      const clauses = filter(props as any)
      if (!clauses) {
        return
      }

      clauses.forEach((clause: any) => selectorClauses.push(clause))
    })

  const selector = {
    $and: selectorClauses,
  }

  console.log('final selector:', selector)

  const result = await db.find({
    selector,
    limit: ARBITRARY_MAX_FIND_LIMIT,
  })

  // const entries = Object.fromEntries((result.docs as JournalEntry[]).map((entry) => [entry._id, entry])) as Record<string, JournalEntry>

  return result.docs as JournalEntry[]
}

export const getEntryTags = async (journalId: string): Promise<Record<string, EntryTag>> => {
  const result = await db.find({
    selector: {
      $and: [{ kind: 'papaya:tag' }, { journalId }],
    },
    limit: ARBITRARY_MAX_FIND_LIMIT,
  })

  return Object.fromEntries((result.docs as EntryTag[]).map((tag) => [tag._id, tag]))
}

export const getOrCreatePapayaMeta = async (): Promise<PapayaMeta> => {
  // Attempt to fetch the meta document by its key
  const results = await db.find({
    selector: {
      kind: 'papaya:meta',
    },
  })
  if (results.docs.length > 0) {
    return results.docs[0] as unknown as PapayaMeta
  }

  const meta: PapayaMeta = { ...makeDefaultPapayaMeta() }
  await db.put(meta)
  return meta
}

export const getJournals = async (): Promise<Record<string, Journal>> => {
  const result = await db.find({
    selector: {
      kind: 'papaya:journal',
    },
    limit: ARBITRARY_MAX_FIND_LIMIT,
  })

  return Object.fromEntries((result.docs as unknown as Journal[]).map((journal) => [journal._id, journal]))
}

export const getArtifacts = async (journalId: string): Promise<Record<string, EntryArtifact>> => {
  const result = await db.find({
    selector: {
      $and: [{ kind: 'papaya:artifact' }, { journalId }],
    },
    limit: ARBITRARY_MAX_FIND_LIMIT,
  })

  return Object.fromEntries((result.docs as EntryArtifact[]).map((artifact) => [artifact._id, artifact]))
}

export const getJournalEntryWithAttachments = async (journalEntryId: string): Promise<JournalEntry> => {
  const entry = (await db.get(journalEntryId, { attachments: true, binary: true })) as JournalEntry
  return entry
}
