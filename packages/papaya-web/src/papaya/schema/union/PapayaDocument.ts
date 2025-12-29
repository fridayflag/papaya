import z from 'zod'
import { Account } from '../documents/Account'
import { Category } from '../documents/Category'
import { EntryArtifact } from '../documents/EntryArtifact'
import { EntryTag } from '../documents/EntryTag'
import { Journal } from '../documents/Journal'
import { JournalEntry } from '../documents/JournalEntry'
import { PapayaMeta } from '../new/legacy/PapayaMeta'

export const PapayaDocument = z.discriminatedUnion('kind', [
  Account,
  Category,
  EntryArtifact,
  EntryTag,
  Journal,
  JournalEntry,
  PapayaMeta,
])
export type PapayaDocument = z.infer<typeof PapayaDocument>
