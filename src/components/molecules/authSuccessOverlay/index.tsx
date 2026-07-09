import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { Typography } from '@/components/atoms/typography'
import { useAuthFeedback } from '@/store/authFeedback/index.store'

// How long the confirmation stays before auto-dismissing. Short on purpose:
// login/logout happen often, so the overlay should reassure and get out of the
// way rather than block.
const AUTO_DISMISS_MS = 1600

// App-level centered success confirmation for auth actions. Mounted once in
// _app; raised via useAuthFeedback().show('login' | 'logout') from the login
// form and the logout flow. Auto-dismisses, or closes on backdrop click.
const AuthSuccessOverlay = () => {
  const t = useTranslations('homePage.auth')
  const success = useAuthFeedback((s) => s.success)
  const clear = useAuthFeedback((s) => s.clear)

  useEffect(() => {
    if (!success) return
    const timer = window.setTimeout(clear, AUTO_DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [success, clear])

  if (!success) return null

  const message =
    success === 'login' ? t('login.successMessage') : t('logoutSuccessMessage')

  return (
    <div
      role='status'
      aria-live='polite'
      onClick={clear}
      className='fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-200'
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className='mx-4 flex flex-col items-center gap-4 rounded-2xl bg-card px-10 py-8 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300'
      >
        <div className='flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg animate-in zoom-in-50 duration-300'>
          <Check className='size-9' strokeWidth={3} />
        </div>
        <Typography
          variant='h6'
          className='text-center font-semibold text-foreground'
        >
          {message}
        </Typography>
      </div>
    </div>
  )
}

export default AuthSuccessOverlay
