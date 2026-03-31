import { useEffect, useState, useCallback } from 'react'

interface UseUnsavedChangesWarning {
  enableUnsavedChangesWarning: (key: string) => void
  disableUnsavedChangesWarning: (key: string) => void
}

export default function useUnsavedChangesWarning(): UseUnsavedChangesWarning {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())

  const enableUnsavedChangesWarning = useCallback((key: string) => {
    setActiveKeys((prev) => new Set([...prev, key]))
  }, [])

  const disableUnsavedChangesWarning = useCallback((key: string) => {
    setActiveKeys((prev) => {
      const newSet = new Set(prev)
      newSet.delete(key)
      return newSet
    })
  }, [])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (activeKeys.size > 0) {
        event.preventDefault()
        event.returnValue = '' // Required for modern browsers
        return ''
      }
    }

    if (activeKeys.size > 0) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [activeKeys])

  return {
    enableUnsavedChangesWarning,
    disableUnsavedChangesWarning,
  }
}
