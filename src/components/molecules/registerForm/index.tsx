import { NextPage } from 'next'
import { AuthType } from '@/components/organisms/authDialog'
import { PhoneField } from '../phoneField'
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

type RegisterFormProps = {
  switchTo: (type: AuthType) => void
  onSuccess?: () => void
}

type RegisterFormData = {
  phoneNumber: string
}

const RegisterForm: NextPage<RegisterFormProps> = (props) => {
  const { onSuccess } = props
  const t = useTranslations()

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormData>({
    defaultValues: {
      phoneNumber: '',
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log('Form data:', data)
      onSuccess?.()
    } catch (error) {
      console.error('Register error:', error)
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
          {t('homePage.auth.register.title')}
        </Typography>
        <Typography variant='muted'>
          {t('homePage.auth.register.description')}
        </Typography>
      </div>

      <form onSubmit={handleFormSubmit} className='space-y-4'>
        <PhoneField
          name='phoneNumber'
          control={control}
          label={t('homePage.auth.common.phoneNumber')}
        />

        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {isSubmitting
            ? t('homePage.auth.register.submittingButton')
            : t('homePage.auth.register.submitButton')}
        </Button>
      </form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <Separator className='w-full' />
        </div>
        <div className='relative flex justify-center'>
          <Typography
            variant='small'
            className='px-3 bg-background text-muted-foreground uppercase tracking-wider'
          >
            hoặc
          </Typography>
        </div>
      </div>

      <Button
        type='button'
        variant='outline'
        className='w-full relative'
        onClick={() => console.log('Google register clicked')}
      >
        <ImageAtom
          src='/svg/google.svg'
          alt='Google'
          className='mr-2 w-4 h-4'
        />
        {t('homePage.auth.register.googleButton')}
      </Button>

      <div className='text-center'>
        <button
          type='button'
          className='transition-colors'
          onClick={() => props.switchTo('login')}
        >
          {t.rich('homePage.auth.register.switchToLogin', {
            u: (chunks) => <u className='underline'>{chunks}</u>,
          })}
        </button>
      </div>
    </div>
  )
}

export default RegisterForm
