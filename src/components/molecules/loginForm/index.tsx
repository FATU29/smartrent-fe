import { NextPage } from 'next'
import { AuthType } from '@/components/organisms/authDialog'
import { PasswordField } from '../passwordField'
import { EmailField } from '../emailField'
import { Button } from '@/components/atoms/button'
import { Separator } from '@/components/atoms/separator'
import { Typography } from '@/components/atoms/typography'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import dynamic from 'next/dynamic'

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

const LoginForm: NextPage<LoginFormProps> = (props) => {
  const { onSuccess } = props
  const t = useTranslations()

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Form data:', data)
      onSuccess?.()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(onSubmit)(e)
  }

  return (
    <div className='space-y-4 md:space-y-5'>
      <div className='space-y-2 text-center'>
        <Typography variant='h3'>{t('homePage.auth.login.title')}</Typography>
        <Typography variant='muted'>
          {t('homePage.auth.login.description')}
        </Typography>
      </div>

      <form onSubmit={handleFormSubmit} className='space-y-4 md:space-y-4'>
        <div className='space-y-3'>
          <EmailField
            name='email'
            control={control}
            label={t('homePage.auth.common.email')}
          />

          <PasswordField
            name='password'
            control={control}
            label={t('homePage.auth.common.password')}
          />
        </div>

        <div className='flex justify-end'>
          <button
            type='button'
            className='underline cursor-pointer'
            onClick={() => props.switchTo('forgotPassword')}
          >
            {t('homePage.auth.login.forgotPassword')}
          </button>
        </div>

        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {isSubmitting
            ? t('homePage.auth.login.submittingButton')
            : t('homePage.auth.login.submitButton')}
        </Button>
      </form>

      <div className='relative my-4 md:my-5'>
        <div className='absolute inset-0 flex items-center'>
          <Separator className='w-full' />
        </div>
        <div className='relative flex justify-center text-xs uppercase font-medium tracking-wider'>
          <span className='px-3 bg-background text-muted-foreground'>hoặc</span>
        </div>
      </div>

      <Button
        type='button'
        variant='outline'
        className='w-full h-9 relative font-medium text-sm'
        onClick={() => console.log('Google login clicked')}
      >
        <ImageAtom
          src='/svg/google.svg'
          alt='Google'
          className='mr-2 w-4 h-4'
        />
        {t('homePage.auth.login.googleButton')}
      </Button>

      <div className='text-center pt-2'>
        <button
          type='button'
          className='text-xs md:text-sm font-medium transition-colors duration-200 cursor-pointer'
          onClick={() => props.switchTo('register')}
        >
          {t.rich('homePage.auth.login.switchToRegister', {
            u: (chunks) => <u className='underline'>{chunks}</u>,
          })}
        </button>
      </div>
    </div>
  )
}

export default LoginForm
