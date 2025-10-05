import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { googleOAuth } from '@/api/services/auth.service'
import { useTranslations } from 'next-intl'
import { useCountdown } from '@/hooks/useCountdown'
import AuthStatusDisplay from '@/components/molecules/auth-status'
import { decodeToken } from '@/utils/decode-jwt'
import { useAuth } from '@/hooks/useAuth'

const REDIRECT_DELAY = 5
const DEFAULT_RETURN_PATH = '/'

interface OAuthResponse {
  data: {
    tokens: {
      accessToken: string
      refreshToken?: string
    }
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
    const returnTo = localStorage.getItem('returnTo') || DEFAULT_RETURN_PATH
    localStorage.removeItem('returnTo')
    router.push(returnTo)
  }, [router])

  const { count, isActive, start } = useCountdown({
    initialCount: REDIRECT_DELAY,
    onComplete: handleRedirect,
  })

  const handleOAuthSuccess = useCallback(
    (response: OAuthResponse) => {
      if (response.data?.tokens) {
        const { user } = decodeToken(response.data.tokens.accessToken)

        login(user, response.data.tokens)
        setStatus('success')
        start()
      }
    },
    [login, start],
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
        const errorMsg = t('auth.oauth.oauth_authorization_failed')
        handleOAuthError(errorMsg)
        return
      }

      if (!code || typeof code !== 'string') {
        return
      }

      try {
        setStatus('loading')
        const response = await googleOAuth(code)
        handleOAuthSuccess(response)
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t('auth.oauth.authentication_failed')
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
          countdown={count}
          isCountdownActive={isActive}
          onRetry={handleRetry}
        />
      </div>
    </div>
  )
}
