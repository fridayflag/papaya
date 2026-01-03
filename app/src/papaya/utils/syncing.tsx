import { AuthStatusEnum, OnlineStatusEnum, SyncStatusEnum } from "@/contexts/RemoteContext"
import { SyncStrategy } from "@/schema/application/syncing"
import { Link } from "@mui/material"
import { ReactNode } from "react"

export enum SyncIndicatorEnum {
  LOADING = 'LOADING',
  SYNC_ERROR = 'SYNC_ERROR',
  LOST_CONNECTION = 'LOST_CONNECTION',
  ERROR_ACTION_REQUIRED = 'ERROR_ACTION_REQUIRED',
  DONE_SUCCESS = 'DONE_SUCCESS',
  ONLINE_IDLE = 'ONLINE_IDLE',
  WORKING_LOCALLY_NO_SYNC = 'WORKING_LOCALLY_NO_SYNC',
  THINKING = 'THINKING',
}

export interface SyncIndication {
  title: ReactNode
  description: ReactNode
  indicator: SyncIndicatorEnum
}

export interface SyncParams {
  authStatus: AuthStatusEnum,
  onlineStatus: OnlineStatusEnum,
  syncStatus: SyncStatusEnum,
  syncStrategy: SyncStrategy,
}

export const getSyncInidication = (syncParams: SyncParams): SyncIndication => {
  const { authStatus, onlineStatus, syncStatus, syncStrategy } = syncParams

  const deafultIndication: SyncIndication = {
    title: 'Working locally',
    description: (
      <>All changes will be maintained locally.<br />You can <Link href='/settings'>connect to a server</Link> to sync remotely</>
    ),
    indicator: SyncIndicatorEnum.WORKING_LOCALLY_NO_SYNC,
  }

  const isOffline = onlineStatus === OnlineStatusEnum.OFFLINE
  const isLoading = [
    authStatus === AuthStatusEnum.AUTHENTICATING,
    syncStatus === SyncStatusEnum.SYNCING,
  ].some(Boolean)

  const isLocalStrategy = [
    syncStrategy.syncType === 'LOCAL',
    syncStrategy.syncType === 'NONE',
  ].some(Boolean)

  if (isLocalStrategy) {
    return deafultIndication
  }

  if (isOffline) {
    return {
      title: 'Offline, working locally',
      description: 'All changes will be saved locally until you are back online',
      indicator: SyncIndicatorEnum.WORKING_LOCALLY_NO_SYNC,
    }
  }

  if (authStatus === AuthStatusEnum.AUTHENTICATING) {
    return {
      title: 'Authenticating...',
      description: 'Authenticating with remote server',
      indicator: SyncIndicatorEnum.LOADING,
    }
  }

  if (authStatus === AuthStatusEnum.UNAUTHENTICATED) {
    return {
      title: 'Login required',
      description: 'You must re-authenticate to sync with the remote server',
      indicator: SyncIndicatorEnum.ERROR_ACTION_REQUIRED,
    }
  }

  if (syncStatus === SyncStatusEnum.SYNCING) {
    return {
      title: 'Syncing...',
      description: 'Pulling and pushing changes to remote server',
      indicator: SyncIndicatorEnum.LOADING,
    }
  }

  if ([SyncStatusEnum.SAVED, SyncStatusEnum.PAUSED].includes(syncStatus)) {
    return {
      title: 'Saved',
      description: 'Your changes have been saved to the remote server',
      indicator: SyncIndicatorEnum.DONE_SUCCESS,
    }
  }

  if (syncStatus === SyncStatusEnum.ERROR) {
    return {
      title: 'Sync error',
      description: 'An error occurred while syncing',
      indicator: SyncIndicatorEnum.SYNC_ERROR,
    }
  }

  return deafultIndication
}
