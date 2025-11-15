import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { LockKeyhole } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'

interface LoginRequiredNoticeProps {
  onLoginClick: () => void
}

/**
 * LoginRequiredNotice
 *
 * Displays a centered notice when user tries to access protected routes without authentication.
 * Shows message with lock icon and login button.
 * Fully translated via next-intl.
 */
export const LoginRequiredNotice = ({
  onLoginClick,
}: LoginRequiredNoticeProps) => {
  const t = useTranslations('auth.loginRequired')

  // Disable body scroll when notice is shown
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'>
      <Card className='mx-4 max-w-md p-8 text-center shadow-lg'>
        <div className='mb-6 flex justify-center'>
          <div className='rounded-full bg-primary/10 p-4'>
            <LockKeyhole className='h-12 w-12 text-primary' />
          </div>
        </div>

        <h2 className='mb-3 text-2xl font-bold'>{t('title')}</h2>

        <p className='mb-6 text-muted-foreground'>{t('description')}</p>

        <Button onClick={onLoginClick} size='lg' className='w-full'>
          {t('loginButton')}
        </Button>
      </Card>
    </div>
  )
}

export default LoginRequiredNotice
