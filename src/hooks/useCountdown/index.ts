import { useState, useEffect, useRef, useCallback } from 'react'

interface UseCountdownOptions {
  initialCount: number
  onComplete?: () => void
  autoStart?: boolean
}

interface UseCountdownReturn {
  count: number
  isActive: boolean
  start: () => void
  stop: () => void
  reset: () => void
}

export const useCountdown = ({
  initialCount,
  onComplete,
  autoStart = false,
}: UseCountdownOptions): UseCountdownReturn => {
  const [count, setCount] = useState(initialCount)
  const [isActive, setIsActive] = useState(autoStart)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const stop = useCallback(() => {
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    setIsActive(true)
  }, [])

  const reset = useCallback(() => {
    stop()
    setCount(initialCount)
  }, [initialCount, stop])

  useEffect(() => {
    if (!isActive) return

    intervalRef.current = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount <= 1) {
          setIsActive(false)
          onComplete?.()
          return 0
        }
        return prevCount - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, onComplete])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    count,
    isActive,
    start,
    stop,
    reset,
  }
}
