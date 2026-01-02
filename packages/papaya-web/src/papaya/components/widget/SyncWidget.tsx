import { RemoteContext } from '@/contexts/RemoteContext'
import { SyncIndicatorEnum } from '@/utils/syncing'
import { Box, Button, CardActions, CardHeader, Divider, LinearProgress } from '@mui/material'
import { useContext } from 'react'
import SyncIcon from '../display/SyncIcon'

export default function SyncWidget() {
  const remoteContext = useContext(RemoteContext)

  const { syncSupported, syncDisabled } = remoteContext
  const { title, description, indicator } = remoteContext.syncIndication

  const handleSync = () => {
    remoteContext.sync()
  }

  return (
    <Box>
      <CardHeader
        avatar={<SyncIcon indicator={indicator} sx={{ transition: 'all 0.3s' }} />}
        title={title}
        subheader={description}
      />
      {syncSupported && (
        <>
          {indicator === SyncIndicatorEnum.LOADING
            ? <LinearProgress variant="indeterminate" />
            : <Divider sx={{ height: '1px', my: '1.5px' }} />
          }
          <CardActions>
            <Button disabled={syncDisabled} onClick={handleSync}>Sync Now</Button>
          </CardActions>
        </>
      )}
    </Box>
  )
}
