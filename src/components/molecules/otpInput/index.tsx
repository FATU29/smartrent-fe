import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/atoms/input'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'sonner'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AuthType } from '@/components/organisms/authDialog'
import { useResendOtp, useVerifyOtp } from '@/hooks/useAuth'
import { verifyOtpResetPassword } from '@/api/services/auth.service'

interface OtpInputProps {
  switchTo: (type: AuthType) => void
  onSuccess: (token?: string) => void
  email: string
  backTo: () => void
  type?: 'register' | 'forgotPassword'
}

type OtpFormData = {
  otp: string
}

const OtpInput: React.FC<OtpInputProps> = ({
  backTo,
  onSuccess,
  email,
  type = 'register',
}) => {
  const t = useTranslations()
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { resendOtp } = useResendOtp()
  const { verifyOtp } = useVerifyOtp()

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setCanResend(true)
    }
  }, [countdown, canResend])

  const otpSchema = yup.object({
    otp: yup
      .string()
      .required(t('homePage.auth.validation.otpRequired'))
      .length(6, t('homePage.auth.validation.otpLength')),
  })

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: yupResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  })

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtpValues = [...otpValues]
    newOtpValues[index] = value

    setOtpValues(newOtpValues)
    setValue('otp', newOtpValues.join(''))

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newOtpValues = pastedData
      .split('')
      .concat(Array(6).fill(''))
      .slice(0, 6)

    setOtpValues(newOtpValues)
    setValue('otp', newOtpValues.join(''))

    const lastFilledIndex = newOtpValues.findIndex((val) => val === '')
    if (lastFilledIndex !== -1) {
      inputRefs.current[lastFilledIndex]?.focus()
    } else {
      inputRefs.current[5]?.focus()
    }
  }

  const handleResend = async () => {
    if (!canResend) return

    try {
      setIsResending(true)

      const result = await resendOtp(email)

      if (result.success) {
        toast.success(t('homePage.auth.otp.resendSuccess'))
      } else {
        toast.error(result.message || t('homePage.auth.otp.resendError'))
      }

      setCanResend(false)
      setCountdown(60)
      setOtpValues(['', '', '', '', '', ''])
      setValue('otp', '')
      inputRefs.current[0]?.focus()

      toast.success(t('homePage.auth.otp.resendSuccess'))
    } catch (error) {
      console.error('OTP resend error:', error)
      toast.error(t('homePage.auth.otp.resendError'))
    } finally {
      setIsResending(false)
    }
  }

  const onSubmit = async () => {
    try {
      setIsVerifying(true)
      let result = null
      if (type === 'register') {
        result = await verifyOtp({
          email,
          verificationCode: otpValues.join(''),
        })
      } else if (type === 'forgotPassword') {
        const code = otpValues.join('')
        result = await verifyOtpResetPassword({
          verificationCode: code,
        })
      }
      if (result?.success) {
        onSuccess?.(result?.data?.resetPasswordToken)
        toast.success(t('homePage.auth.otp.verificationSuccess'))
      } else {
        toast.error(result?.message || t('homePage.auth.otp.verificationError'))
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error(t('homePage.auth.otp.verificationError'))
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-3 text-center'>
        <Typography variant='h3' className='!mb-2'>
          {t('homePage.auth.otp.title')}
        </Typography>
        <Typography variant='muted'>
          {t('homePage.auth.otp.description', { contact: email })}
        </Typography>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div className='space-y-4'>
          <div className='flex justify-center gap-3'>
            {otpValues.map((value, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type='text'
                inputMode='numeric'
                pattern='[0-9]*'
                maxLength={1}
                value={value}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={cn(
                  'w-12 h-12 text-center text-lg font-semibold',
                  errors.otp &&
                    'border-destructive focus-visible:border-destructive',
                )}
                aria-label={t('homePage.auth.otp.digitLabel', {
                  position: index + 1,
                })}
              />
            ))}
          </div>

          {errors.otp && (
            <Typography
              variant='small'
              className='text-destructive text-center'
            >
              {errors.otp.message}
            </Typography>
          )}
        </div>

        <Button
          type='submit'
          disabled={
            isVerifying || isResending || otpValues.join('').length !== 6
          }
          className='w-full'
        >
          {isVerifying
            ? t('homePage.auth.otp.verifyingButton')
            : t('homePage.auth.otp.verifyButton')}
        </Button>
      </form>

      <div className='text-center space-y-3'>
        <Typography variant='muted' className='text-sm'>
          {t('homePage.auth.otp.didntReceive')}
        </Typography>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={handleResend}
          disabled={!canResend || isResending}
          className='text-primary hover:text-primary/80'
        >
          <RotateCcw className='w-4 h-4 mr-2' />
          {isResending
            ? t('homePage.auth.otp.resendingButton')
            : canResend
              ? t('homePage.auth.otp.resendButton')
              : t('homePage.auth.otp.resendCountdown', { seconds: countdown })}
        </Button>
      </div>

      <div className='text-center'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => backTo()}
          className='text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          {t('homePage.auth.otp.back')}
        </Button>
      </div>
    </div>
  )
}

export default OtpInput
