import { NextPage } from 'next'
import { AuthType } from '@/components/organisms/authDialog'
import { PasswordField } from '../passwordField'
import { EmailField } from '../emailField'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Typography } from '@/components/atoms/typography'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import dynamic from 'next/dynamic'
import SeparatorOr from '@/components/atoms/separatorOr'
import { useLogin, useResendOtp, useRequestMagicLink } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { VALIDATION_PATTERNS, API_ERROR_CODES } from '@/api/types/auth.type'
import { googleOAuthURL } from '@/utils/googleOAuth2'
import { useState, useCallback } from 'react'
import OtpInput from '../otpInput'
import SuccessMessage from '../successMessage'
import { Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

const ImageAtom = dynamic(() => import('@/components/atoms/imageAtom'), {
  ssr: false,
  loading: () => <div className='w-4 h-4 bg-muted animate-pulse rounded' />,
})

type LoginFormProps = {
  switchTo: (type: AuthType) => void
  onSuccess?: () => void
}

type LoginFormData = {
  email: string
  password: string
}

type LoginStep =
  | 'login'
  | 'verifyAccount'
  | 'verifySuccess'
  | 'magicLink'
  | 'magicLinkSent'

const LoginForm: NextPage<LoginFormProps> = (props) => {
  const t = useTranslations()
  const { loginUser } = useLogin()
  const { resendOtp } = useResendOtp()
  const { requestMagicLink } = useRequestMagicLink()
  const [currentStep, setCurrentStep] = useState<LoginStep>('login')
  const [verifyEmail, setVerifyEmail] = useState('')
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const [magicLinkExpiresIn, setMagicLinkExpiresIn] = useState(0)

  const { onSuccess } = props

  const loginSchema = yup.object({
    email: yup
      .string()
      .required(t('homePage.auth.validation.emailRequired'))
      .matches(
        VALIDATION_PATTERNS.EMAIL,
        t('homePage.auth.validation.emailInvalid'),
      ),
    password: yup
      .string()
      .required(t('homePage.auth.validation.passwordRequired'))
      .min(8, t('homePage.auth.validation.loginPasswordMinLength')),
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const [magicLinkInput, setMagicLinkInput] = useState('')
  const [magicLinkInputError, setMagicLinkInputError] = useState<string | null>(
    null,
  )
  const [isMagicLinkSubmitting, setIsMagicLinkSubmitting] = useState(false)

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginUser(data)

      if (result.success) {
        onSuccess?.()
        toast.success(t('homePage.auth.login.successMessage'))
      } else if (result.code === API_ERROR_CODES.USER_NOT_VERIFIED) {
        // Account not verified — resend OTP and switch to verify UI
        setVerifyEmail(data.email)
        toast.info(t('homePage.auth.verifyAccount.notVerifiedMessage'))

        // Auto-resend verification code
        try {
          await resendOtp(data.email)
        } catch {
          // Silently handle resend failure — user can manually resend via OTP screen
        }

        setCurrentStep('verifyAccount')
      } else {
        toast.error(result.message || t('homePage.auth.login.errorMessage'))
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(t('homePage.auth.login.errorMessage'))
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(onSubmit)(e)
  }

  const handleLoginGoogle = () => {
    // Persist current path as returnUrl before redirecting to Google
    try {
      const currentPath = window.location.pathname + window.location.search
      localStorage.setItem('returnUrl', currentPath)
    } catch {}
    window.location.href = googleOAuthURL
  }

  const handleVerifySuccess = useCallback(() => {
    setCurrentStep('verifySuccess')
  }, [])

  const handleBackToLogin = useCallback(() => {
    setCurrentStep('login')
    setVerifyEmail('')
    setMagicLinkEmail('')
    setMagicLinkInput('')
    setMagicLinkInputError(null)
  }, [])

  const handleMagicLinkFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedEmail = magicLinkInput.trim()
    if (!trimmedEmail) {
      setMagicLinkInputError(t('homePage.auth.validation.emailRequired'))
      return
    }
    if (!VALIDATION_PATTERNS.EMAIL.test(trimmedEmail)) {
      setMagicLinkInputError(t('homePage.auth.validation.emailInvalid'))
      return
    }
    setMagicLinkInputError(null)

    setIsMagicLinkSubmitting(true)
    try {
      const result = await requestMagicLink({ email: trimmedEmail })

      if (result.success && result.data) {
        setMagicLinkEmail(trimmedEmail)
        setMagicLinkExpiresIn(result.data.expiresInSeconds)
        setCurrentStep('magicLinkSent')
      } else {
        toast.error(
          result.message || t('homePage.auth.magicLink.requestErrorMessage'),
        )
      }
    } finally {
      setIsMagicLinkSubmitting(false)
    }
  }

  // Verify account OTP step
  if (currentStep === 'verifyAccount') {
    return (
      <OtpInput
        email={verifyEmail}
        onSuccessRegister={handleVerifySuccess}
        backTo={handleBackToLogin}
        type='register'
      />
    )
  }

  // Verify success step
  if (currentStep === 'verifySuccess') {
    return (
      <SuccessMessage
        onClick={handleBackToLogin}
        title={t('homePage.auth.verifyAccount.successTitle')}
        description={t('homePage.auth.verifyAccount.successDescription')}
        buttonText={t('homePage.auth.verifyAccount.backToLogin')}
        showButton={true}
      />
    )
  }

  // Magic-link email entry step
  if (currentStep === 'magicLink') {
    return (
      <div className='space-y-3 md:space-y-5'>
        <div className='space-y-3 text-center'>
          <Typography variant='h3' className='!mb-2'>
            {t('homePage.auth.magicLink.title')}
          </Typography>
          <Typography variant='muted'>
            {t('homePage.auth.magicLink.description')}
          </Typography>
        </div>

        <form onSubmit={handleMagicLinkFormSubmit}>
          <div className='space-y-2'>
            <div>
              <Label className='mb-2' htmlFor='magic-link-email'>
                {t('homePage.auth.common.email')}
                <span className='text-destructive ml-1'>*</span>
              </Label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 -translate-y-1/2'>
                  <Mail
                    className={cn(
                      'h-4 w-4 text-muted-foreground',
                      magicLinkInputError && 'text-destructive',
                    )}
                  />
                </div>
                <Input
                  id='magic-link-email'
                  type='email'
                  autoComplete='email'
                  value={magicLinkInput}
                  onChange={(e) => {
                    setMagicLinkInput(e.target.value)
                    if (magicLinkInputError) setMagicLinkInputError(null)
                  }}
                  placeholder={t('homePage.auth.common.emailPlaceholder')}
                  aria-invalid={magicLinkInputError ? 'true' : 'false'}
                  className={cn(
                    'h-10 md:h-12 pl-10',
                    magicLinkInputError &&
                      'border-destructive focus-visible:border-destructive',
                  )}
                />
              </div>
              {magicLinkInputError && (
                <Typography variant='small' className='text-destructive mt-2'>
                  {magicLinkInputError}
                </Typography>
              )}
            </div>
          </div>

          <Button
            type='submit'
            disabled={isMagicLinkSubmitting}
            className='w-full mt-4'
          >
            {isMagicLinkSubmitting
              ? t('homePage.auth.magicLink.submittingButton')
              : t('homePage.auth.magicLink.submitButton')}
          </Button>
        </form>

        <div className='text-center'>
          <Typography
            as='span'
            className='text-sm underline cursor-pointer text-primary'
            onClick={handleBackToLogin}
          >
            {t('homePage.auth.magicLink.backToLogin')}
          </Typography>
        </div>
      </div>
    )
  }

  // Magic-link sent confirmation step
  if (currentStep === 'magicLinkSent') {
    const minutes = Math.max(1, Math.floor(magicLinkExpiresIn / 60))
    return (
      <div className='space-y-6 text-center'>
        <div className='flex justify-center'>
          <div className='flex items-center justify-center w-16 h-16 rounded-full bg-primary/10'>
            <Mail className='w-8 h-8 text-primary' />
          </div>
        </div>

        <div className='space-y-3'>
          <Typography variant='h3' className='!mb-2'>
            {t('homePage.auth.magicLink.sentTitle')}
          </Typography>
          <Typography variant='muted'>
            {t('homePage.auth.magicLink.sentDescription', {
              email: magicLinkEmail,
              minutes,
            })}
          </Typography>
        </div>

        <Button
          variant='outline'
          className='w-full'
          onClick={handleBackToLogin}
        >
          {t('homePage.auth.magicLink.backToLogin')}
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-3 md:space-y-5'>
      <div className='space-y-3 text-center'>
        <Typography variant='h3' className='!mb-2'>
          {t('homePage.auth.login.title')}
        </Typography>
        <Typography variant='muted'>
          {t('homePage.auth.login.description')}
        </Typography>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className='space-y-2'>
          <EmailField
            name='email'
            control={control}
            label={t('homePage.auth.common.email')}
            error={errors.email?.message}
          />

          <PasswordField
            name='password'
            control={control}
            label={t('homePage.auth.common.password')}
            error={errors.password?.message}
          />
        </div>

        <div className='flex justify-end my-2'>
          <Typography
            variant='p'
            className='underline cursor-pointer text-primary'
            onClick={() => props.switchTo('forgotPassword')}
          >
            {t('homePage.auth.login.forgotPassword')}
          </Typography>
        </div>

        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {isSubmitting
            ? t('homePage.auth.login.submittingButton')
            : t('homePage.auth.login.submitButton')}
        </Button>
      </form>

      <SeparatorOr />

      <div className='space-y-2'>
        <Button
          type='button'
          variant='outline'
          className='w-full'
          onClick={handleLoginGoogle}
        >
          <ImageAtom
            src='/svg/google.svg'
            alt='Google'
            width={16}
            height={16}
            className='mr-2'
          />
          {t('homePage.auth.login.googleButton')}
        </Button>

        <Button
          type='button'
          variant='outline'
          className='w-full'
          onClick={() => setCurrentStep('magicLink')}
        >
          <Mail className='w-4 h-4 mr-2 text-primary' />
          {t('homePage.auth.login.magicLinkButton')}
        </Button>
      </div>

      <div className='text-center'>
        <Typography variant='p' className='text-sm text-muted-foreground'>
          {t('homePage.auth.login.noAccount')}{' '}
          <Typography
            as='span'
            className='text-sm underline cursor-pointer text-primary'
            onClick={() => props.switchTo('register')}
          >
            {t('homePage.auth.login.registerLink')}
          </Typography>
        </Typography>
      </div>
    </div>
  )
}

export default LoginForm
