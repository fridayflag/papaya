import { AuthStatusEnum, OnlineStatusEnum, RemoteContext, SyncErrorEnum, SyncProgressEnum } from '@/contexts/RemoteContext';
import { getDatabaseClient } from '@/database/client';
import { useUserPreferences } from '@/hooks/state/useUserPreferences';
import { hasSessionOrRefreshCookie } from '@/utils/cookie';
import { usernameToDbName } from '@/utils/database';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

interface UserContext {
  // TODO 
  username: string;
}

export default function RemoteContextProvider(props: PropsWithChildren) {
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [syncError, setSyncError] = useState<SyncErrorEnum | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncProgressEnum>(SyncProgressEnum.IDLE)
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatusEnum>(OnlineStatusEnum.ONLINE)
  const [authStatus, setAuthStatus] = useState<AuthStatusEnum>(() => {
    if (hasSessionOrRefreshCookie()) {
      return AuthStatusEnum.AUTHENTICATING;
    }
    return AuthStatusEnum.UNAUTHENTICATED;
  });

  const remoteDb = useRef<PouchDB.Database | null>(null)
  const remoteDbSyncHandler = useRef<PouchDB.Replication.Sync<object> | null>(null)

  const userPreferences = useUserPreferences();

  useEffect(() => {
    authenticate();
    initRemoteConnection();

    return () => {
      closeRemoteConnection();
    }
  }, []);

  // Offline event listeners
  useEffect(() => {
    // Perform initial auth
    authenticate()

    const wentOnline = () => {
      setOnlineStatus(OnlineStatusEnum.ONLINE)
    }
    const wentOffline = () => {
      setOnlineStatus(OnlineStatusEnum.OFFLINE)
    }

    window.addEventListener('online', wentOnline);
    window.addEventListener('offline', wentOffline);

    return () => {
      window.removeEventListener('online', wentOnline);
      window.removeEventListener('offline', wentOffline);
    }
  }, []);

  /**
   * Hits the _session endpoint to check authentication
   * @returns true if the user is currently signed in
   */
  const authenticate = async (): Promise<boolean> => {
    setAuthStatus(AuthStatusEnum.AUTHENTICATING)

    const response = await fetch(`/api/session`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const userContext: UserContext = await response.json();
      setUserContext(userContext);
      setAuthStatus(AuthStatusEnum.AUTHENTICATED)
      return true
    } else {
      setAuthStatus(AuthStatusEnum.UNAUTHENTICATED);
    }

    return false;
  }


  const closeRemoteConnection = () => {
    // Cancel existing sync handling and close existing database
    if (remoteDbSyncHandler.current) {
      remoteDbSyncHandler.current.cancel()
    }
    // Close connection
    if (remoteDb.current) {
      remoteDb.current.close()
    }
  }

  const sync = async (): Promise<void> => {
    if (!remoteDb.current) {
      console.log('No remote database found, skipping sync')
      return
    }
    const db = getDatabaseClient()
    db.sync(remoteDb.current)
  }

  const initRemoteConnection = async () => {
    setSyncStatus(SyncProgressEnum.CONNECTING_TO_REMOTE);

    if (!userContext) {
      setSyncStatus(SyncProgressEnum.IDLE);
      setSyncError(SyncErrorEnum.USER_UNAUTHENTICATED);
      return;
    }

    const databaseName = usernameToDbName(userContext.username);
    const databaseUrl = `${window.location.origin}/db/${databaseName}`
    console.log('Connecting to remote database:', databaseUrl);

    remoteDb.current = new PouchDB(databaseUrl)
    const db = getDatabaseClient()
    remoteDbSyncHandler.current = db
      .sync(remoteDb.current, {
        live: true,
        retry: false,
      })
      .on('change', function (_change) {
        setSyncStatus(SyncProgressEnum.IDLE)
      })
      .on('paused', function () {
        // replication was paused, usually because of a lost connection
        setSyncStatus(SyncProgressEnum.PAUSED)
      })
      .on('active', function () {
        // replication was resumed
        setSyncStatus(SyncProgressEnum.SYNCING)
      })
      .on('error', function (err) {
        console.error('Sync error:', err)
        setSyncStatus(SyncProgressEnum.ERROR)
      })
      .on('complete', function () {
        setSyncStatus(SyncProgressEnum.SAVED)
      });

    // Perform initial sync
    sync();
  }

  const remoteContext: RemoteContext = {
    syncError,
    syncStatus,
    authStatus,
    onlineStatus,
    syncSupported: true,
    syncDisabled: false,
    sync,
  }

  return (
    <RemoteContext.Provider value={remoteContext}>
      {props.children}
    </RemoteContext.Provider>
  );
}
