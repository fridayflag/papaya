import { SyncIndicatorEnum } from '@/utils/syncing'
import { Announcement, Bedtime, CloudDone, CloudOff, Computer, Sync, SyncProblem } from '@mui/icons-material'

interface SyncIconProps extends Record<any, any> {
  indicator: SyncIndicatorEnum
}

export default function SyncIcon(props: SyncIconProps) {
  const { indicator, ...rest } = props

  switch (indicator) {
    case SyncIndicatorEnum.LOADING:
      return <Sync {...rest} />

    case SyncIndicatorEnum.DONE_SUCCESS:
      return <CloudDone {...rest} />

    case SyncIndicatorEnum.LOST_CONNECTION:
      return <CloudOff {...rest} />

    case SyncIndicatorEnum.ERROR_ACTION_REQUIRED:
      return <Announcement />

    case SyncIndicatorEnum.SYNC_ERROR:
      return <SyncProblem {...rest} />

    case SyncIndicatorEnum.ONLINE_IDLE:
      return <Bedtime />

    case SyncIndicatorEnum.WORKING_LOCALLY_NO_SYNC:
    default:
      return <Computer {...rest} />
  }
}
