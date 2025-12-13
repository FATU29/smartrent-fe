import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { useAuthDialog } from '@/contexts/authDialog'
import LoginRequiredNotice from '@/components/molecules/loginRequiredNotice'

/**
 * AuthRouteGate
 *
 * Works with middleware.ts to handle authentication flow:
 *
 * 1. Middleware adds ?auth=login to protected routes when user is unauthenticated
 * 2. This component detects ?auth=login and shows LoginRequiredNotice
 * 3. User clicks login button to open AuthDialog
 * 4. After successful login, user stays on current route
 *
 * Translation:
 * - Uses LoginRequiredNotice component with full translation support
 * - AuthDialog also has full translation support
 */
export const AuthRouteGate = () => {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { openAuth } = useAuthDialog()
  const [showLoginNotice, setShowLoginNotice] = useState(false)

  // Handle middleware flag to show login notice & persist returnUrl
  useEffect(() => {
    if (!router.isReady) return
    const { auth, returnUrl } = router.query
    const is404Page = router.pathname === '/404'

    if (auth === 'login' && !isAuthenticated && !is404Page) {
      setShowLoginNotice(true)
      if (typeof returnUrl === 'string') {
        try {
          localStorage.setItem('returnUrl', returnUrl)
        } catch {}
      }
    } else if ((auth !== 'login' || is404Page) && showLoginNotice) {
      // Hide notice when auth flag is removed or on 404 page
      setShowLoginNotice(false)
    }
  }, [
    router.isReady,
    router.query,
    router.pathname,
    isAuthenticated,
    showLoginNotice,
  ])

  // Redirect to returnUrl after successful login (from query or sessionStorage)
  useEffect(() => {
    if (isAuthenticated && showLoginNotice && router.isReady) {
      setShowLoginNotice(false)
      const currentPath = router.asPath?.split('?')[0] || '/'
      const queryReturnUrl =
        typeof router.query.returnUrl === 'string' && router.query.returnUrl
          ? (router.query.returnUrl as string)
          : undefined
      let storedReturnUrl: string | null = null
      try {
        storedReturnUrl = localStorage.getItem('returnUrl')
      } catch {}
      const target = queryReturnUrl || storedReturnUrl || currentPath

      const cleanup = () => {
        try {
          localStorage.removeItem('returnUrl')
        } catch {}
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { auth, returnUrl, ...rest } = router.query
        if (router.pathname) {
          router.replace(
            { pathname: router.pathname, query: rest },
            undefined,
            {
              shallow: true,
            },
          )
        }
      }

      if (target && target !== currentPath && target !== '/undefined') {
        router.replace(target).finally(cleanup)
      } else {
        cleanup()
      }
    }
  }, [isAuthenticated, showLoginNotice, router])

  const handleLoginClick = () => {
    // Save current URL as returnUrl
    // Ensure router is ready and asPath exists
    if (!router.isReady || !router.asPath) return
    const currentUrl = router.asPath.split('?')[0] || '/'
    try {
      localStorage.setItem('returnUrl', currentUrl)
    } catch {}
    openAuth('login', currentUrl)
  }

  if (showLoginNotice && !isAuthenticated) {
    return <LoginRequiredNotice onLoginClick={handleLoginClick} />
  }

  return null
}

export default AuthRouteGate
