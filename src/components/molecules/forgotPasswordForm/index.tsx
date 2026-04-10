import { NextPage } from 'next'
import { AuthType } from '@/components/organisms/authDialog'
import { EmailField } from '../emailField'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { AuthService } from '@/api/services/auth.service'
import { toast } from 'sonner'

type ForgotPasswordFormProps = {
  switchTo: (type: AuthType) => void
  onSuccess?: (email: string) => void
}

type ForgotPasswordFormData = {
  email: string
}

const ForgotPasswordForm: NextPage<ForgotPasswordFormProps> = (props) => {
  const { onSuccess } = props
  const t = useTranslations()
  const fallbackErrorMessage = t('homePage.auth.forgotPassword.error')

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await AuthService.resendOtp(data.email)

      if (response.success) {
        onSuccess?.(data.email)
      } else {
        toast.error(response.message?.trim() || fallbackErrorMessage)
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      const errorMessage = error instanceof Error ? error.message?.trim() : ''
      toast.error(errorMessage || fallbackErrorMessage)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(onSubmit)(e)
  }

  return (
    <div className='space-y-4 md:space-y-5'>
      <div className='space-y-2 text-center'>
        <Typography variant='h3' className='!mb-2'>
          {t('homePage.auth.forgotPassword.title')}
        </Typography>
        <Typography variant='muted'>
          {t('homePage.auth.forgotPassword.description')}
        </Typography>
      </div>

      <form onSubmit={handleFormSubmit} className='space-y-4'>
        <EmailField
          name='email'
          control={control}
          label={t('homePage.auth.common.email')}
        />

        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {isSubmitting
            ? t('homePage.auth.forgotPassword.submittingButton')
            : t('homePage.auth.forgotPassword.submitButton')}
        </Button>
      </form>

      <div className='text-center'>
        <button
          type='button'
          className='transition-colors cursor-pointer'
          onClick={() => props.switchTo('login')}
        >
          {t.rich('homePage.auth.forgotPassword.switchToLogin', {
            u: (chunks) => <u className='underline text-primary'>{chunks}</u>,
          })}
        </button>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
