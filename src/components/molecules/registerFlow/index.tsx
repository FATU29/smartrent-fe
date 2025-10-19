import { NextPage } from 'next'
import { AuthType } from '@/components/organisms/authDialog'
import { useTranslations } from 'next-intl'
import RegisterForm from '../registerForm'
import OtpInput from '../otpInput'
import SuccessMessage from '../successMessage'
import { useCallback, useState } from 'react'

type RegisterFlowProps = {
  switchTo: (type: AuthType) => void
}

type FlowStep = 'register' | 'otp' | 'success'

const RegisterFlow: NextPage<RegisterFlowProps> = (props) => {
  const { switchTo } = props
  const t = useTranslations()
  const [currentStep, setCurrentStep] = useState<FlowStep>('register')
  const [email, setEmail] = useState('')

  const handleRegisterSuccess = useCallback((registeredEmail: string) => {
    setEmail(registeredEmail)
    setCurrentStep('otp')
  }, [])

  const handleOtpSuccess = useCallback(() => {
    setCurrentStep('success')
  }, [])

  const handleBackToRegister = useCallback(() => {
    setCurrentStep('register')
  }, [])

  const handleFinalSuccess = useCallback(() => {
    switchTo('login')
  }, [])

  const renderCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 'register':
        return (
          <RegisterForm switchTo={switchTo} onSuccess={handleRegisterSuccess} />
        )
      case 'otp':
        return (
          <OtpInput
            email={email}
            onSuccessRegister={handleOtpSuccess}
            backTo={handleBackToRegister}
          />
        )
      case 'success':
        return (
          <SuccessMessage
            onClick={handleFinalSuccess}
            title={t('homePage.auth.register.successTitle')}
            description={t('homePage.auth.register.successDescription')}
            buttonText={t('homePage.auth.register.backToLogin')}
            showButton={true}
          />
        )
      default:
        return null
    }
  }, [
    currentStep,
    email,
    handleBackToRegister,
    handleFinalSuccess,
    handleOtpSuccess,
    handleRegisterSuccess,
    switchTo,
    t,
  ])

  return <>{renderCurrentStep()}</>
}

export default RegisterFlow
