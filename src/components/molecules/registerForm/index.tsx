import { NextPage } from 'next'
import { AuthType } from '@/components/organisms/authDialog'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { FormField } from '../formField'
import { PasswordField } from '../passwordField'
import { EmailField } from '../emailField'
import { useTranslations } from 'next-intl'
import { useForm, useController } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import dynamic from 'next/dynamic'
import SeparatorOr from '@/components/atoms/separatorOr'
import { useRegister } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { EMAIL_REGEX, PASSWORD_STRENGTH_REGEX } from '@/constants/regex'
import { googleOAuthURL } from '@/utils/googleOAuth2'

const ImageAtom = dynamic(() => import('@/components/atoms/imageAtom'), {
  ssr: false,
  loading: () => <div className='w-4 h-4 bg-muted animate-pulse rounded' />,
})

type RegisterFormProps = {
  switchTo: (type: AuthType) => void
  onSuccess?: (email: string) => void
}

type RegisterFormData = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

const RegisterForm: NextPage<RegisterFormProps> = (props) => {
  const { switchTo, onSuccess } = props
  const t = useTranslations()
  const { registerUser } = useRegister()

  const registerSchema = yup.object({
    firstName: yup
      .string()
      .required(t('homePage.auth.validation.firstNameRequired'))
      .min(2, t('homePage.auth.validation.firstNameMinLength')),
    lastName: yup
      .string()
      .required(t('homePage.auth.validation.lastNameRequired'))
      .min(2, t('homePage.auth.validation.lastNameMinLength')),
    email: yup
      .string()
      .required(t('homePage.auth.validation.emailRequired'))
      .matches(EMAIL_REGEX, t('homePage.auth.validation.emailInvalid')),
    password: yup
      .string()
      .required(t('homePage.auth.validation.passwordRequired'))
      .min(8, t('homePage.auth.validation.passwordMinLength'))
      .matches(
        PASSWORD_STRENGTH_REGEX,
        t('homePage.auth.validation.passwordPattern'),
      ),
    confirmPassword: yup
      .string()
      .required(t('homePage.auth.validation.confirmPasswordRequired'))
      .oneOf(
        [yup.ref('password')],
        t('homePage.auth.validation.confirmPasswordMatch'),
      ),
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const firstNameController = useController({
    name: 'firstName',
    control,
  })

  const lastNameController = useController({
    name: 'lastName',
    control,
  })

  // Email handled by EmailField component via control/name

  const confirmPasswordController = useController({
    name: 'confirmPassword',
    control,
  })

  const onSubmit = async (data: RegisterFormData) => {
    const body = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    }

    const result = await registerUser(body)

    if (result.success) {
      onSuccess?.(data.email)
      toast.success(t('homePage.auth.register.successMessage'))
    } else {
      toast.error(result.message || t('homePage.auth.register.errorMessage'))
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(onSubmit)(e)
  }

  const handleRegisterGoogle = () => {
    window.location.href = googleOAuthURL
  }

  return (
    <div className='space-y-3 md:space-y-5'>
      <div className='space-y-3 text-center'>
        <Typography variant='h3' className='!mb-2'>
          {t('homePage.auth.register.title')}
        </Typography>
        <Typography variant='muted'>
          {t('homePage.auth.register.description')}
        </Typography>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className='space-y-6'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                label={t('homePage.auth.register.firstName')}
                placeholder={t('homePage.auth.register.firstNamePlaceholder')}
                required
                error={errors.firstName?.message}
                {...firstNameController.field}
              />

              <FormField
                label={t('homePage.auth.register.lastName')}
                placeholder={t('homePage.auth.register.lastNamePlaceholder')}
                required
                error={errors.lastName?.message}
                {...lastNameController.field}
              />
            </div>

            <EmailField
              name='email'
              control={control}
              label={t('homePage.auth.common.email')}
              placeholder={t('homePage.auth.common.emailPlaceholder')}
            />

            <PasswordField
              name='password'
              control={control}
              label={t('homePage.auth.common.password')}
              placeholder={t('homePage.auth.common.passwordPlaceholder')}
              required
            />

            <FormField
              label={t('homePage.auth.register.confirmPassword')}
              placeholder={t(
                'homePage.auth.register.confirmPasswordPlaceholder',
              )}
              type='password'
              required
              error={errors.confirmPassword?.message}
              {...confirmPasswordController.field}
            />
          </div>
        </div>

        <Button
          type='submit'
          disabled={isSubmitting}
          className='w-full mt-6 cursor-pointer'
        >
          {isSubmitting
            ? t('homePage.auth.register.submittingButton')
            : t('homePage.auth.register.submitButton')}
        </Button>
      </form>

      <SeparatorOr />

      <Button
        type='button'
        variant='outline'
        className='w-full'
        onClick={handleRegisterGoogle}
      >
        <ImageAtom
          src='/svg/google.svg'
          alt='Google'
          width={16}
          height={16}
          className='mr-2'
        />
        {t('homePage.auth.register.googleButton')}
      </Button>

      <div className='text-center pb-10 md:pb-0'>
        <Typography variant='p' className='text-sm text-muted-foreground'>
          {t('homePage.auth.register.haveAccount')}{' '}
          <Typography
            as='span'
            className='text-sm underline cursor-pointer text-primary'
            onClick={() => switchTo('login')}
          >
            {t('homePage.auth.register.loginLink')}
          </Typography>
        </Typography>
      </div>
    </div>
  )
}

export default RegisterForm
