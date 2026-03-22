import { AlertProps } from '@mui/material'
import { createContext, ReactNode } from 'react'

interface Notification {
  message: string
}

export interface SnackbarAction {
  label: string
  onClick: () => void
}

export interface SnackbarNotification extends Notification {
  action?: SnackbarAction
}

export interface DialogNotification extends Notification {
  dialogTitle: string
  onClose?: () => void
}

export interface Alert {
  id: string
  title: string | ReactNode
  description: string | ReactNode
  confirmationMessage?: string
  severity?: AlertProps['severity']
}

export interface NotificationsContext {
  snackbar: (notification: SnackbarNotification) => void
  dialog: (notification: DialogNotification) => void
  alert: (alert: Omit<Alert, 'id'>) => void
  activeAlerts: Alert[]
  dismissAlert: (id: string) => void
}

export const NotificationsContext = createContext<NotificationsContext>({
  snackbar: () => { },
  dialog: () => { },
  alert: () => { },
  activeAlerts: [],
  dismissAlert: () => { },
})
