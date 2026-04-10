import { NextPage } from 'next'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { PasswordField } from '../passwordField'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { resetPassword } from '@/api/services/auth.service'

type NewPasswordFormProps = {
  onSuccess?: () => void
  onBack?: () => void
  email?: string
  resetPasswordToken?: string
}

type NewPasswordFormData = {
  newPassword: string
  confirmPassword: string
}

const NewPasswordForm: NextPage<NewPasswordFormProps> = (props) => {
  const { onSuccess, onBack, resetPasswordToken } = props
  const t = useTranslations()
  const fallbackErrorMessage = t('homePage.auth.newPassword.error')

  const passwordSchema = yup.object({
    newPassword: yup
      .string()
      .required(t('homePage.auth.validation.passwordRequired'))
      .min(8, t('homePage.auth.validation.passwordMinLength'))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        t('homePage.auth.validation.passwordPattern'),
      ),
    confirmPassword: yup
      .string()
      .required(t('homePage.auth.validation.confirmPasswordRequired'))
      .oneOf(
        [yup.ref('newPassword')],
        t('homePage.auth.validation.passwordsDoNotMatch'),
      ),
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<NewPasswordFormData>({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: NewPasswordFormData) => {
    try {
      const result = await resetPassword({
        resetPasswordToken: resetPasswordToken || '',
        newPassword: data.newPassword,
      })

      if (result.success) {
        toast.success(t('homePage.auth.newPassword.success'))
        onSuccess?.()
      } else {
        toast.error(result.message?.trim() || fallbackErrorMessage)
      }
    } catch (error) {
      console.error('Reset password error:', error)
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
          {t('homePage.auth.newPassword.title')}
        </Typography>
        <Typography variant='muted'>
          {t('homePage.auth.newPassword.description')}
        </Typography>
      </div>

      <form onSubmit={handleFormSubmit} className='space-y-4'>
        <div className='space-y-4'>
          <PasswordField
            name='newPassword'
            control={control}
            label={t('homePage.auth.newPassword.newPasswordLabel')}
            error={errors.newPassword?.message}
            placeholder={t('homePage.auth.newPassword.newPasswordPlaceholder')}
          />

          <PasswordField
            name='confirmPassword'
            control={control}
            label={t('homePage.auth.newPassword.confirmPasswordLabel')}
            error={errors.confirmPassword?.message}
            placeholder={t(
              'homePage.auth.newPassword.confirmPasswordPlaceholder',
            )}
          />
        </div>

        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {isSubmitting
            ? t('homePage.auth.newPassword.submittingButton')
            : t('homePage.auth.newPassword.submitButton')}
        </Button>
      </form>

      {onBack && (
        <div className='text-center'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onBack}
            className='text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            {t('homePage.auth.newPassword.backToOtp')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default NewPasswordForm
