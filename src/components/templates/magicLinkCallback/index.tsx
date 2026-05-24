import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import AuthStatusDisplay from '@/components/molecules/auth-status'
import { useVerifyMagicLink } from '@/hooks/useAuth'
import { API_ERROR_CODES } from '@/api/types/auth.type'

const DEFAULT_RETURN_PATH = '/'

type CallbackStatus = 'loading' | 'success' | 'error'

export default function MagicLinkCallback() {
  const router = useRouter()
  const t = useTranslations()
  const { verifyMagicLink } = useVerifyMagicLink()
  const [status, setStatus] = useState<CallbackStatus>('loading')
  const [error, setError] = useState<string>('')
  // Magic-link tokens are single-use — guard against React StrictMode / re-renders
  // re-firing the POST and burning the token before we can return success.
  const verifiedRef = useRef(false)

  const handleRedirect = useCallback(() => {
    let target = DEFAULT_RETURN_PATH
    try {
      const stored = localStorage.getItem('returnUrl')
      if (
        stored &&
        stored !== 'undefined' &&
        stored !== '/undefined' &&
        stored.startsWith('/')
      ) {
        target = stored
      }
      localStorage.removeItem('returnUrl')
      localStorage.removeItem('returnTo')
    } catch {}
    router.replace(target)
  }, [router])

  const handleRetry = useCallback(() => {
    router.push(DEFAULT_RETURN_PATH)
  }, [router])

  useEffect(() => {
    if (!router.isReady) return
    if (verifiedRef.current) return

    const { token } = router.query
    if (!token || typeof token !== 'string') {
      verifiedRef.current = true
      setStatus('error')
      setError(t('homePage.auth.magicLink.errors.invalid'))
      return
    }

    verifiedRef.current = true

    const run = async () => {
      try {
        const result = await verifyMagicLink({ token })

        if (result.success) {
          setStatus('success')
          handleRedirect()
          return
        }

        const code = result.code
        let message = t('homePage.auth.magicLink.errors.generic')
        if (
          code === API_ERROR_CODES.MAGIC_LINK_INVALID ||
          code === API_ERROR_CODES.MAGIC_LINK_ALREADY_USED
        ) {
          message = t('homePage.auth.magicLink.errors.invalid')
        }
        setStatus('error')
        setError(message)
      } catch (err) {
        console.error('Magic link verify error:', err)
        setStatus('error')
        setError(t('homePage.auth.magicLink.errors.generic'))
      }
    }

    run()
  }, [router.isReady, router.query, t, verifyMagicLink, handleRedirect])

  return (
    <div className='min-h-screen flex items-center justify-center bg-muted/40 px-4'>
      <div className='w-full max-w-sm mx-auto bg-card rounded-lg shadow-md p-4 sm:p-6 sm:max-w-md'>
        <AuthStatusDisplay
          status={status}
          error={error}
          onRetry={handleRetry}
        />
      </div>
    </div>
  )
}
