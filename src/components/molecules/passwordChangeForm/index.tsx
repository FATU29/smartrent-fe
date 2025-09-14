import * as React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { PasswordField } from '../passwordField'
import { Lock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/atoms/separator'
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
  const [showRequirements, setShowRequirements] = React.useState(false)
  const [showAccountActions, setShowAccountActions] = React.useState(false)

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
    watch,
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

  const newPassword = watch('newPassword')

  const handleFormSubmit = (data: PasswordChangeFormData) => {
    onSubmit?.(data)
  }

  const getPasswordStrength = (password: string) => {
    const requirements = [
      {
        text: t(
          'homePage.auth.accountManagement.passwordChange.requirements.minLength',
        ),
        met: password.length >= 8,
      },
      {
        text: t(
          'homePage.auth.accountManagement.passwordChange.requirements.lowercase',
        ),
        met: /[a-z]/.test(password),
      },
      {
        text: t(
          'homePage.auth.accountManagement.passwordChange.requirements.number',
        ),
        met: /[0-9]/.test(password),
      },
    ]
    return requirements
  }

  const requirements = getPasswordStrength(newPassword || '')

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

        <Separator />

        {/* Password Requirements */}
        <div className='space-y-3'>
          <button
            type='button'
            onClick={() => setShowRequirements(!showRequirements)}
            className='flex items-center justify-between w-full text-left'
          >
            <Typography variant='h4' className='font-medium text-foreground'>
              {t(
                'homePage.auth.accountManagement.passwordChange.passwordRequirements',
              )}
            </Typography>
            {showRequirements ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </button>

          {showRequirements && (
            <div className='space-y-2 pl-4'>
              {requirements.map((req, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      req.met ? 'bg-green-500' : 'bg-gray-300',
                    )}
                  />
                  <Typography
                    variant='small'
                    className={cn(
                      req.met ? 'text-green-600' : 'text-muted-foreground',
                    )}
                  >
                    {req.text}
                  </Typography>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Account Actions */}
        <div className='space-y-3'>
          <button
            type='button'
            onClick={() => setShowAccountActions(!showAccountActions)}
            className='flex items-center justify-between w-full text-left'
          >
            <Typography variant='h4' className='font-medium text-foreground'>
              {t(
                'homePage.auth.accountManagement.passwordChange.accountActions',
              )}
            </Typography>
            {showAccountActions ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </button>

          {showAccountActions && (
            <div className='space-y-4 pl-4'>
              <div className='flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800'>
                <AlertTriangle className='h-5 w-5 text-amber-600 mt-0.5' />
                <div className='space-y-2'>
                  <Typography
                    variant='small'
                    className='text-amber-800 dark:text-amber-200'
                  >
                    <strong>
                      {t(
                        'homePage.auth.accountManagement.passwordChange.warningTitle',
                      )}
                    </strong>
                  </Typography>
                  <ul className='space-y-1 text-sm text-amber-700 dark:text-amber-300'>
                    <li>
                      •{' '}
                      {t(
                        'homePage.auth.accountManagement.passwordChange.warnings.invoice',
                      )}
                    </li>
                    <li>
                      •{' '}
                      {t(
                        'homePage.auth.accountManagement.passwordChange.warnings.accuracy',
                      )}
                    </li>
                    <li>
                      •{' '}
                      {t(
                        'homePage.auth.accountManagement.passwordChange.warnings.timing',
                      )}
                    </li>
                    <li>
                      •{' '}
                      {t(
                        'homePage.auth.accountManagement.passwordChange.warnings.service',
                      )}
                    </li>
                    <li>
                      •{' '}
                      {t(
                        'homePage.auth.accountManagement.passwordChange.warnings.support',
                      )}
                    </li>
                  </ul>
                </div>
              </div>

              <div className='flex gap-3'>
                <Button variant='outline' className='flex-1'>
                  {t(
                    'homePage.auth.accountManagement.passwordChange.lockAccount',
                  )}
                </Button>
                <Button variant='destructive' className='flex-1'>
                  {t(
                    'homePage.auth.accountManagement.passwordChange.deleteAccount',
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export { PasswordChangeForm }
