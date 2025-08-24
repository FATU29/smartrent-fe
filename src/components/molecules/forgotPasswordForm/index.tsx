import { NextPage } from 'next'
import { AuthType } from '@/components/organisms/authDialog'
import { EmailOrPhoneField } from '../emailOrPhoneField'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'

type ForgotPasswordFormProps = {
  switchTo: (type: AuthType) => void
  onSuccess?: () => void
}

type ForgotPasswordFormData = {
  emailOrPhone: string
}

const ForgotPasswordForm: NextPage<ForgotPasswordFormProps> = (props) => {
  const { onSuccess } = props
  const t = useTranslations()

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      emailOrPhone: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      console.log('Form data:', data)
      onSuccess?.()
    } catch (error) {
      console.error('Forgot password error:', error)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(onSubmit)(e)
  }

  return (
    <div className='space-y-4 md:space-y-5'>
      <div className='space-y-2 text-center'>
        <Typography variant='h3'>
          {t('homePage.auth.forgotPassword.title')}
        </Typography>
        <Typography variant='muted'>
          {t('homePage.auth.forgotPassword.description')}
        </Typography>
      </div>

      <form onSubmit={handleFormSubmit} className='space-y-4'>
        <EmailOrPhoneField
          name='emailOrPhone'
          control={control}
          label={t('homePage.auth.common.emailOrPhone')}
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
          className='transition-colors'
          onClick={() => props.switchTo('login')}
        >
          {t.rich('homePage.auth.forgotPassword.switchToLogin', {
            u: (chunks) => <u className='underline'>{chunks}</u>,
          })}
        </button>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
