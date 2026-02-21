import {
  Alert,
  DialogNotification,
  NotificationsContext,
  SnackbarAction,
  SnackbarNotification,
} from '@/contexts/NotificationsContext'
import { Close } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
} from '@mui/material'
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'

const renderAction = (action: SnackbarAction) => {
  return <Button onClick={() => action.onClick()}>{action.label}</Button>
}

const ALERT_PERSISTENCE_KEY = 'papaya:alerts'

const NotificationsProvider = (props: PropsWithChildren) => {
  const [dialogNotification, setDialogNotification] = useState<DialogNotification | null>(null)
  const [snackbarNotification, setSnackbarNotification] = useState<SnackbarNotification | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)

  /**
   * Persists an alert so it can be loaded on subsequent app loads.
   * 
   * Implements localStorage.
   */
  const persistAlert = async (alert: Alert): Promise<void> => {
    const alerts = await loadAlerts()
    alerts.push(alert)
    localStorage.setItem(ALERT_PERSISTENCE_KEY, JSON.stringify(alerts))
  }

  /**
   * Loads alerts from localStorage.
   */
  const loadAlerts = async (): Promise<Alert[]> => {
    const alertData = localStorage.getItem(ALERT_PERSISTENCE_KEY)
    let alerts: Alert[] = []
    try {
      alerts = alertData ? JSON.parse(alertData) as Alert[] : []
    } catch (error) {
      console.error('Error parsing alerts from localStorage', error)
    }
    return alerts
  }

  /**
   * Deletes an alert from localStorage.
   */
  const deleteAlert = async (id: string): Promise<void> => {
    const alerts = await loadAlerts()
    const filteredAlerts = alerts.filter(alert => alert.id !== id)
    localStorage.setItem(ALERT_PERSISTENCE_KEY, JSON.stringify(filteredAlerts))
  }

  const snackbar = useCallback((notification: SnackbarNotification) => {
    setSnackbarNotification(notification)
    setSnackbarOpen(true)
  }, [])

  const dialog = useCallback((notification: DialogNotification): void => {
    setDialogNotification(notification)
    setDialogOpen(true)
  }, [])

  const alert = useCallback((alertData: Omit<Alert, 'id'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: crypto.randomUUID(),
    }
    persistAlert(newAlert)
    setAlerts(prevAlerts => [...prevAlerts, newAlert])
  }, [])

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id))
    deleteAlert(id)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false)
    dialogNotification?.onClose?.()
  }, [dialogNotification])

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const contextValue = useMemo(
    () => ({
      snackbar,
      dialog,
      alert,
      activeAlerts: alerts,
      dismissAlert,
    }),
    [snackbar, dialog, alert, alerts, dismissAlert],
  )

  useEffect(() => {
    loadAlerts().then(alerts => setAlerts(alerts))
  }, [])

  return (
    <NotificationsContext.Provider value={contextValue}>
      {props.children}
      <Dialog
        open={dialogOpen && Boolean(dialogNotification)}
        onClose={() => handleCloseDialog()}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>{dialogNotification?.dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogNotification?.message}</DialogContentText>
          <DialogActions>
            <Button onClick={() => handleCloseDialog()} variant="contained">
              OK
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000} // 6s
        onClose={handleCloseSnackbar}
        action={
          <>
            {snackbarNotification?.action && renderAction(snackbarNotification.action)}
            <IconButton size="small" aria-label="close" onClick={() => handleCloseSnackbar()} color="inherit">
              <Close />
            </IconButton>
          </>
        }
        message={snackbarNotification?.message}
      />
    </NotificationsContext.Provider>
  )
}

export default NotificationsProvider
