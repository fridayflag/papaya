import { EmptyObject } from "@/types/utility-types"

export type OrmDocument<T = EmptyObject> = T & {
  _id: string
  _rev: string | undefined
}
