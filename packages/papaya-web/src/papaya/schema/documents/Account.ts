import { Avatar } from '@/schema/new/legacy/Avatar'
import { Document } from '@/schema/support/orm/Document'
import { Mixin } from '@/schema/support/orm/Mixin'
import z from 'zod'

export const [CreateAccount, Account] = Document.fromSchemas([
  {
    kind: z.literal('papaya:account'),

    label: z.string(),
    description: z.string(),
    avatar: Avatar,
  },
  {
    ...Mixin.derived.timestamps(),
    ...Mixin.derived.belongsToJournal(),
  },
])

export type CreateAccount = z.output<typeof CreateAccount>
export type Account = z.output<typeof Account>
