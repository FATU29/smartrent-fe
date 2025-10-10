import { NextPage } from 'next'
import { useCallback, useState } from 'react'
import { AuthType } from '@/components/organisms/authDialog'
import { useTranslations } from 'next-intl'
import ForgotPasswordForm from '../forgotPasswordForm'
import OtpInput from '../otpInput'
import NewPasswordForm from '../newPasswordForm'
import SuccessMessage from '../successMessage'

type ForgotPasswordFlowProps = {
  switchTo: (type: AuthType) => void
}

type FlowStep = 'email' | 'otp' | 'newPassword' | 'success'

const ForgotPasswordFlow: NextPage<ForgotPasswordFlowProps> = (props) => {
  const { switchTo } = props
  const t = useTranslations()
  const [currentStep, setCurrentStep] = useState<FlowStep>('email')
  const [email, setEmail] = useState('')
  const [resetPasswordToken, setResetPasswordToken] = useState('')

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail)
    setCurrentStep('otp')
  }

  const handleOtpSuccess = useCallback((token?: string) => {
    if (token && token !== resetPasswordToken) {
      setResetPasswordToken(token)
    }
    setCurrentStep('newPassword')
  }, [])

  const handleNewPasswordSuccess = useCallback(() => {
    setResetPasswordToken('')
    setCurrentStep('success')
  }, [])

  const handleBackToOtp = useCallback(() => {
    setCurrentStep('otp')
  }, [])

  const handleFinalSuccess = useCallback(() => {
    switchTo('login')
  }, [])

  const handleBackToEmail = useCallback(() => {
    setCurrentStep('email')
  }, [])

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'email':
        return (
          <ForgotPasswordForm
            switchTo={switchTo}
            onSuccess={handleEmailSubmit}
          />
        )
      case 'otp':
        return (
          <OtpInput
            email={email}
            onSuccessForgot={handleOtpSuccess}
            backTo={handleBackToEmail}
            type='forgotPassword'
          />
        )
      case 'newPassword':
        return (
          <NewPasswordForm
            email={email}
            onSuccess={handleNewPasswordSuccess}
            onBack={handleBackToOtp}
            resetPasswordToken={resetPasswordToken}
          />
        )
      case 'success':
        return (
          <SuccessMessage
            onClick={handleFinalSuccess}
            title={t('homePage.auth.forgotPassword.successTitle')}
            description={t('homePage.auth.forgotPassword.successDescription')}
            buttonText={t('homePage.auth.forgotPassword.backToLogin')}
            showButton={true}
          />
        )
      default:
        return null
    }
  }

  return <>{renderCurrentStep()}</>
}

export default ForgotPasswordFlow
