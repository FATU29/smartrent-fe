import * as React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { PasswordField } from '../passwordField'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VALIDATION_PATTERNS } from '@/api/types/auth.type'

type PasswordChangeFormData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type PasswordChangeFormProps = {
  onSubmit?: (data: PasswordChangeFormData) => void
  loading?: boolean
  className?: string
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  onSubmit,
  loading = false,
  className,
}) => {
  const t = useTranslations()
  // Password requirements section removed per product request

  const validationSchema = yup.object({
    currentPassword: yup
      .string()
      .required(t('homePage.auth.validation.currentPasswordRequired')),
    newPassword: yup
      .string()
      .required(t('homePage.auth.validation.newPasswordRequired'))
      .min(8, t('homePage.auth.validation.newPasswordMinLength'))
      .matches(
        VALIDATION_PATTERNS.PASSWORD,
        t('homePage.auth.validation.passwordPattern'),
      ),
    confirmPassword: yup
      .string()
      .required(t('homePage.auth.validation.confirmPasswordRequired'))
      .oneOf(
        [yup.ref('newPassword')],
        t('homePage.auth.validation.confirmPasswordMatch'),
      ),
  })

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PasswordChangeFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  const handleFormSubmit = (data: PasswordChangeFormData) => {
    onSubmit?.(data)
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-3'>
          <Lock className='h-5 w-5 text-primary' />
          <Typography variant='h3' className='text-lg font-semibold'>
            {t('homePage.auth.accountManagement.passwordChange.title')}
          </Typography>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
          <PasswordField
            name='currentPassword'
            control={control}
            label={t(
              'homePage.auth.accountManagement.passwordChange.currentPassword',
            )}
            placeholder={t('homePage.auth.common.passwordPlaceholder')}
            error={errors.currentPassword?.message}
          />

          <PasswordField
            name='newPassword'
            control={control}
            label={t(
              'homePage.auth.accountManagement.passwordChange.newPassword',
            )}
            placeholder={t('homePage.auth.common.passwordPlaceholder')}
            error={errors.newPassword?.message}
          />

          <PasswordField
            name='confirmPassword'
            control={control}
            label={t(
              'homePage.auth.accountManagement.passwordChange.confirmPassword',
            )}
            placeholder={t('homePage.auth.register.confirmPasswordPlaceholder')}
            error={errors.confirmPassword?.message}
          />

          <div className='flex justify-end pt-2'>
            <Button
              type='submit'
              disabled={!isValid || loading}
              className='min-w-[120px]'
            >
              {loading
                ? t('homePage.auth.accountManagement.passwordChange.saving')
                : t(
                    'homePage.auth.accountManagement.passwordChange.saveChanges',
                  )}
            </Button>
          </div>
        </form>

        {/* Password requirements section removed */}
      </div>
    </Card>
  )
}

export { PasswordChangeForm }
