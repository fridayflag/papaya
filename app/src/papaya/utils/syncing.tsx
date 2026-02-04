import { AuthStatusEnum, OnlineStatusEnum, SyncProgressEnum } from "@/contexts/RemoteContext"
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
  syncStatus: SyncProgressEnum,
}
