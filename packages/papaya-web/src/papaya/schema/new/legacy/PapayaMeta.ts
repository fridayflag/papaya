import z from 'zod'
import { UserSettings } from '../../models/UserSettings'
import { Document } from '../../support/orm/Document'
import { Mixin } from '../../support/orm/Mixin'

export const [CreatePapayaMeta, PapayaMeta] = Document.fromSchemas([
  {
    kind: z.literal('papaya:meta'),
    activeJournalId: z.string().nullable(),
    userSettings: UserSettings,
  },
  {
    ...Mixin.derived.timestamps(),
  },
])
export type CreatePapayaMeta = z.output<typeof CreatePapayaMeta>
export type PapayaMeta = z.output<typeof PapayaMeta>
