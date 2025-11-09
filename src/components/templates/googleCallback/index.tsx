import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { googleOAuth } from '@/api/services/auth.service'
import { useTranslations } from 'next-intl'
import AuthStatusDisplay from '@/components/molecules/auth-status'
import { decodeToken } from '@/utils/decode-jwt'
import { useAuth } from '@/hooks/useAuth'

const DEFAULT_RETURN_PATH = '/'

interface OAuthResponse {
  data?: {
    accessToken: string
    refreshToken: string
  }
  message: string | null
  code: string
  success: boolean
}

export default function GoogleCallback() {
  const router = useRouter()
  const { login } = useAuth()
  const t = useTranslations()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  )
  const [error, setError] = useState<string>('')

  const handleRedirect = useCallback(() => {
    // Prefer unified returnUrl key used by middleware/AuthRouteGate
    const returnUrl = localStorage.getItem('returnUrl')
    const legacyReturnTo = localStorage.getItem('returnTo')
    const target = returnUrl || legacyReturnTo || DEFAULT_RETURN_PATH
    // Cleanup both keys to avoid stale redirects
    try {
      localStorage.removeItem('returnUrl')
      localStorage.removeItem('returnTo')
    } catch {}
    // Use replace to avoid creating a new history entry for the callback page
    router.replace(target)
  }, [router])

  const handleOAuthSuccess = useCallback(
    (response: OAuthResponse) => {
      console.log('response', response)
      if (response.data) {
        const { accessToken, refreshToken } = response.data
        const { user } = decodeToken(accessToken)
        login(user, { accessToken, refreshToken })
        setStatus('success')
        handleRedirect()
      }
    },
    [login, handleRedirect],
  )

  const handleOAuthError = useCallback((errorMessage: string) => {
    console.error('Google callback error:', errorMessage)
    setStatus('error')
    setError(errorMessage)
  }, [])

  useEffect(() => {
    const handleCallback = async () => {
      const { code, error: oauthError } = router.query

      if (oauthError) {
        const errorMsg = t('homePage.auth.oauth.oauth_authorization_failed')
        handleOAuthError(errorMsg)
        return
      }

      if (!code || typeof code !== 'string') {
        return
      }

      try {
        setStatus('loading')
        const response = await googleOAuth(code)
        if (!response.success) {
          throw new Error(response.message || 'Authentication failed')
        }
        handleOAuthSuccess(response)
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t('homePage.auth.oauth.authentication_failed')
        handleOAuthError(errorMessage)
      }
    }

    if (router.isReady) {
      handleCallback()
    }
  }, [router.isReady, router.query, t, handleOAuthSuccess, handleOAuthError])

  const handleRetry = useCallback(() => {
    router.push(DEFAULT_RETURN_PATH)
  }, [router])

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
      <div className='w-full max-w-sm mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6 sm:max-w-md'>
        <AuthStatusDisplay
          status={status}
          error={error}
          onRetry={handleRetry}
        />
      </div>
    </div>
  )
}
