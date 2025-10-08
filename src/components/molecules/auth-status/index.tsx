import { RefreshCw, CheckCircle, XCircle, Home } from 'lucide-react'
import { useTranslations } from 'next-intl'
import CountdownTimer from '@/components/atoms/countdown-timer'

type AuthStatus = 'loading' | 'success' | 'error'

interface AuthStatusDisplayProps {
  status: AuthStatus
  error?: string
  countdown?: number
  isCountdownActive?: boolean
  onRetry?: () => void
}

export default function AuthStatusDisplay({
  status,
  error,
  countdown = 0,
  isCountdownActive = false,
  onRetry,
}: AuthStatusDisplayProps) {
  const t = useTranslations()

  const statusConfig = {
    loading: {
      icon: (
        <RefreshCw className='h-10 w-10 sm:h-12 sm:w-12 animate-spin text-blue-600 mx-auto' />
      ),
      title: t('auth.oauth.processing_login'),
      description: t('auth.oauth.please_wait'),
      bgColor: 'bg-blue-50',
    },
    success: {
      icon: (
        <div className='mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100'>
          <CheckCircle className='h-5 w-5 sm:h-6 sm:w-6 text-green-600' />
        </div>
      ),
      title: t('auth.oauth.login_successful'),
      description: t('auth.oauth.redirecting'),
      bgColor: 'bg-green-50',
    },
    error: {
      icon: (
        <div className='mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100'>
          <XCircle className='h-5 w-5 sm:h-6 sm:w-6 text-red-600' />
        </div>
      ),
      title: t('auth.oauth.login_failed'),
      description: error,
      bgColor: 'bg-red-50',
    },
  }

  const config = statusConfig[status]

  return (
    <div className='text-center'>
      {config.icon}

      <h2 className='mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-900'>
        {config.title}
      </h2>

      {config.description && (
        <p className='mt-2 text-xs sm:text-sm text-gray-600'>
          {config.description}
        </p>
      )}

      {status === 'success' && (
        <CountdownTimer
          count={countdown}
          isActive={isCountdownActive}
          className='mt-4'
        />
      )}

      {status === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className='mt-4 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
          type='button'
          aria-label={t('common.go_home')}
        >
          <Home className='h-3 w-3 sm:h-4 sm:w-4 mr-2' aria-hidden='true' />
          {t('common.go_home')}
        </button>
      )}
    </div>
  )
}
