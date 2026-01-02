import { createContext } from 'react'
import { SyncIndication } from '../utils/syncing'

export enum OnlineStatusEnum {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export enum AuthStatusEnum {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  AUTHENTICATING = 'AUTHENTICATING',
  AUTHENTICATED = 'AUTHENTICATED',
}

export enum SyncStatusEnum {
  /**
   * Syncing has not started
   */
  IDLE = 'IDLE',
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
  MISSING_DATABASE = 'MISSING_DATABASE',
}

export interface RemoteContext {
  authStatus: AuthStatusEnum,
  onlineStatus: OnlineStatusEnum
  syncStatus: SyncStatusEnum,
  // syncError: SyncErrorEnum,
  syncDisabled: boolean
  syncSupported: boolean
  syncIndication: SyncIndication
  sync: () => Promise<void>
}

export const RemoteContext = createContext<RemoteContext>({} as RemoteContext)
