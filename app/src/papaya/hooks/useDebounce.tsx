import { useCallback, useRef } from 'react'

// Define a generic type for our async function
type AsyncFunction<Args extends any[], R> = (...args: Args) => Promise<R>

/**
 * A custom hook that returns a debounced version of an async function,
 * plus a "flush" method to immediately execute any pending call.
 *
 * @param fn - The asynchronous function you want to debounce.
 * @param delay - The debounce delay in milliseconds.
 * @returns A tuple: [debouncedFunction, flushFunction]
 */
export function useDebounce<Args extends any[], R>(
  fn: AsyncFunction<Args, R>,
  delay: number,
): [(...args: Args) => Promise<R>, () => Promise<void>] {
  // Timer ID for the pending timeout
  const timerIdRef = useRef<number | undefined>(undefined)

  // Stores the pending promise's resolve/reject to later be fulfilled or rejected
  interface PendingCall {
    resolve: (value: R | PromiseLike<R>) => void
    reject: (reason?: unknown) => void
  }
  const pendingRef = useRef<PendingCall | null>(null)

  // Holds the most recent arguments passed to the debounced function
  const argsRef = useRef<Args | null>(null)

  const debouncedFn = useCallback(
    (...args: Args): Promise<R> => {
      // Clear any existing timer
      if (timerIdRef.current !== undefined) {
        clearTimeout(timerIdRef.current)
      }

      // Create a new promise that will be resolved/rejected when fn eventually runs
      const promise = new Promise<R>((resolve, reject) => {
        pendingRef.current = { resolve, reject }
      })

      // Store the latest arguments
      argsRef.current = args

      // Schedule the async function call after the specified delay
      timerIdRef.current = window.setTimeout(async () => {
        timerIdRef.current = undefined
        const currentPending = pendingRef.current
        pendingRef.current = null

        if (!currentPending) return

        try {
          // Execute the original function with the last known arguments
          const result = await fn(...(argsRef.current as Args))
          currentPending.resolve(result)
        } catch (error) {
          currentPending.reject(error)
        }
      }, delay)

      return promise
    },
    [fn, delay],
  )

  const flush = useCallback(async () => {
    // If there's a timer waiting, clear it and execute immediately
    if (timerIdRef.current !== undefined) {
      clearTimeout(timerIdRef.current)
      timerIdRef.current = undefined
    }

    const currentPending = pendingRef.current
    if (!currentPending) return

    pendingRef.current = null
    try {
      // Call the function now with the most recent arguments
      const result = await fn(...(argsRef.current as Args))
      currentPending.resolve(result)
    } catch (error) {
      currentPending.reject(error)
    }
  }, [fn])

  return [debouncedFn, flush]
}
