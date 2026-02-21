import { useMemo } from 'react'

interface UseBrowserPlatform {
  macOs: boolean
}

export default function useBrowserPlatform(): UseBrowserPlatform {
  const macOs: boolean = useMemo(() => {
    if (typeof window === 'undefined') {
      return false
    }
    const platform = window?.navigator?.platform || ''
    return platform.toUpperCase().startsWith('MAC')
  }, [])

  return {
    macOs,
  }
}
