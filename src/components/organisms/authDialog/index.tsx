import React, { ReactNode, useCallback, useState, lazy, Suspense } from 'react'
import { NextPage } from 'next'
import { Dialog, DialogContent } from '@/components/atoms/dialog'
import { Skeleton } from '@/components/atoms/skeleton'
import ImageAtom from '@/components/atoms/imageAtom'
import { basePath } from '@/constants'

const LoginForm = lazy(() => import('@/components/molecules/loginForm'))
const RegisterForm = lazy(() => import('@/components/molecules/registerForm'))
const ForgotPasswordForm = lazy(
  () => import('@/components/molecules/forgotPasswordForm'),
)

export type AuthType = 'login' | 'register' | 'forgotPassword'

type AuthDialogProps = {
  type?: AuthType
  open?: boolean
  handleOpen?: () => void
  handleClose?: () => void
}

const AuthDialog: NextPage<AuthDialogProps> = (props) => {
  const { open = false, type = 'login', handleClose } = props
  const [authType, setAuthType] = useState<AuthType>(type)

  const switchTo = useCallback((type: AuthType) => {
    setAuthType(type)
  }, [])

  const getAuthComponent = (type: AuthType): ReactNode | null => {
    const FormComponent = () => {
      switch (type) {
        case 'login':
          return <LoginForm switchTo={switchTo} />
        case 'register':
          return <RegisterForm switchTo={switchTo} />
        case 'forgotPassword':
          return <ForgotPasswordForm switchTo={switchTo} />
        default:
          return null
      }
    }

    return (
      <Suspense
        fallback={
          <div className='space-y-4'>
            <div className='space-y-2 text-center'>
              <Skeleton className='h-8 w-48 mx-auto' />
              <Skeleton className='h-4 w-64 mx-auto' />
            </div>
            <div className='space-y-4'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>
        }
      >
        <FormComponent />
      </Suspense>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='h-dvh w-screen rounded-none md:rounded-xl md:max-w-4xl md:max-h-[80vh]'>
        <div className='flex flex-col md:flex-row h-full overflow-hidden'>
          <div className='md:flex-1 relative h-[7rem] md:h-auto'>
            <div className='absolute md:top-1/2 left-1/2 -translate-x-1/2 md:-translate-y-1/2'>
              <ImageAtom
                src={`${basePath}/images/rental_bg.jpg`}
                alt='bg_in_auth'
                className='aspect-square w-[8rem] md:min-w-[25rem]'
              />
            </div>
          </div>
          <div className='flex-1 flex items-start justify-center overflow-y-auto'>
            <div className='w-full max-w-xs p-4 md:p-6 py-6 md:py-8'>
              {getAuthComponent(authType)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AuthDialog
