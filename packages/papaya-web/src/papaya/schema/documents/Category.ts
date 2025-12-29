import { Avatar } from '@/schema/new/legacy/Avatar'
import { Document } from '@/schema/support/orm/Document'
import { Mixin } from '@/schema/support/orm/Mixin'
import z from 'zod'

export const [CreateCategory, Category] = Document.fromSchemas([
  {
    kind: z.literal('papaya:category'),
    label: z.string(),
    description: z.string(),
    avatar: Avatar,
  },
  {
    ...Mixin.derived.timestamps(),
    ...Mixin.derived.belongsToJournal(),
  },
])

export type CreateCategory = z.output<typeof CreateCategory>
export type Category = z.output<typeof Category>
