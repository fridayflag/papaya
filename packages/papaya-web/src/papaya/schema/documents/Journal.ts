import { Avatar } from '@/schema/new/legacy/Avatar'
import { Document } from '@/schema/support/orm/Document'
import { Mixin } from '@/schema/support/orm/Mixin'
import z from 'zod'

export const [CreateJournal, Journal] = Document.fromSchemas([
  {
    kind: z.literal('papaya:journal'),
    journalName: z.string(),
    description: z.string().optional(),
    avatar: Avatar,
  },
  {
    ...Mixin.derived.timestamps(),
  },
])

export type CreateJournal = z.output<typeof CreateJournal>
export type Journal = z.output<typeof Journal>
