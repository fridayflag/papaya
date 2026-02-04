import { UserContext } from '@/schema/application/remote-schemas'
import { createContext } from 'react'

export enum OnlineStatusEnum {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export enum AuthStatusEnum {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  AUTHENTICATING = 'AUTHENTICATING',
  AUTHENTICATED = 'AUTHENTICATED',
}

export enum SyncProgressEnum {
  /**
   * Syncing has not started
   */
  IDLE = 'IDLE',
  /**
   * Connecting to remote database
   */
  CONNECTING_TO_REMOTE = 'CONNECTING_TO_REMOTE',
  /**
   * Currently syncing
   */
  SYNCING = 'SYNCING',
  /**
   * Previous sync was successful
   */
  SAVED = 'SAVED',
  /**
   * Syncing was paused, likely do to connection loss
   */
  PAUSED = 'PAUSED',
  /**
   * Sync error occurred
   */
  ERROR = 'ERROR'
}

export enum SyncErrorEnum {
  USER_UNAUTHENTICATED = 'USER_UNAUTHENTICATED',
  DATABASE_WAS_MISSING = 'DATABASE_WAS_MISSING',
  USER_NOT_AUTHORIZED = 'USER_NOT_AUTHORIZED',
}

export type RemoteContext = {
  userContext: UserContext | null,
  authStatus: AuthStatusEnum,
  onlineStatus: OnlineStatusEnum
  syncStatus: SyncProgressEnum,
  syncError: SyncErrorEnum | null,
  syncDisabled: boolean
  syncSupported: boolean
  sync: () => Promise<void>
}

export const RemoteContext = createContext<RemoteContext>({} as RemoteContext)
