import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

interface UseBeforeUnloadOptions {
  enabled?: boolean
  onBeforeUnload?: (e: BeforeUnloadEvent) => void
  onRouteChangeStart?: () => void
}

/**
 * Hook to detect navigation away from page
 * Handles both browser navigation (reload, back button) and Next.js router navigation
 */
export const useBeforeUnload = ({
  enabled = true,
  onBeforeUnload,
  onRouteChangeStart,
}: UseBeforeUnloadOptions) => {
  const router = useRouter()
  const isNavigatingRef = useRef(false)

  // Handle browser navigation (reload, back button, close tab)
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (onBeforeUnload) {
        onBeforeUnload(e)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled, onBeforeUnload])

  // Handle Next.js router navigation
  useEffect(() => {
    if (!enabled) return

    const handleRouteChangeStart = () => {
      if (!isNavigatingRef.current && onRouteChangeStart) {
        isNavigatingRef.current = true
        onRouteChangeStart()
      }
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
    }
  }, [enabled, router.events, onRouteChangeStart])

  const allowNavigation = () => {
    isNavigatingRef.current = false
  }

  return {
    allowNavigation,
  }
}
