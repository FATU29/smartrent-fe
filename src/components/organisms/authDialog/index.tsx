import React, {
  useCallback,
  useState,
  lazy,
  Suspense,
  useEffect,
  useMemo,
} from 'react'
import { NextPage } from 'next'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  VisuallyHidden,
} from '@/components/atoms/dialog'
import { Skeleton } from '@/components/atoms/skeleton'
import ImageAtom from '@/components/atoms/imageAtom'
import Logo from '@/components/atoms/logo'
import { basePath, DEFAULT_IMAGE } from '@/constants'

const LoginForm = lazy(() => import('@/components/molecules/loginForm'))
const RegisterFlow = lazy(() => import('@/components/molecules/registerFlow'))
const ForgotPasswordFlow = lazy(
  () => import('@/components/molecules/forgotPasswordFlow'),
)

export type AuthType =
  | 'login'
  | 'register'
  | 'forgotPassword'
  | 'otp'
  | 'success'

type AuthDialogProps = {
  type?: AuthType
  open?: boolean
  handleOpen?: () => void
  handleClose?: () => void
}

const AuthDialog: NextPage<AuthDialogProps> = (props) => {
  const { open = false, type = 'login', handleClose } = props
  const [authType, setAuthType] = useState<AuthType>(type)

  useEffect(() => {
    if (open) {
      setAuthType(type)
    }
  }, [open, type])

  const switchTo = useCallback((type: AuthType) => {
    setAuthType(type)
  }, [])

  const authComponent = useMemo(() => {
    switch (authType) {
      case 'login':
        return <LoginForm switchTo={switchTo} onSuccess={handleClose} />
      case 'register':
        return <RegisterFlow switchTo={switchTo} />
      case 'forgotPassword':
        return <ForgotPasswordFlow switchTo={switchTo} />
      default:
        return null
    }
  }, [authType, switchTo, handleClose])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='w-full overflow-y-auto h-dvh rounded-none md:rounded-xl md:h-[80vh] md:max-w-[60rem]'>
        <VisuallyHidden>
          <DialogTitle>
            {authType === 'login'
              ? 'Login'
              : authType === 'register'
                ? 'Register'
                : authType === 'forgotPassword'
                  ? 'Reset Password'
                  : 'Authentication'}
          </DialogTitle>
          <DialogDescription>
            {authType === 'login'
              ? 'Sign in to your account'
              : authType === 'register'
                ? 'Create a new account'
                : authType === 'forgotPassword'
                  ? 'Reset your password'
                  : 'Authentication required'}
          </DialogDescription>
        </VisuallyHidden>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
          <div className='flex flex-col gap-8 md:flex-row md:gap-10'>
            <div className='flex justify-center items-center'>
              <div className='w-[8rem] h-[8rem] md:h-[20rem] md:w-[20rem]'>
                <ImageAtom
                  src={`${basePath}/ima ges/rental-auth-bg.jpg`}
                  defaultImage={DEFAULT_IMAGE}
                  alt='bg_in_auth'
                  className='shrink-0 aspect-square w-full h-full rounded-lg'
                  priority={true}
                />
              </div>
            </div>
            <div className='flex justify-center md:overflow-y-auto'>
              <div className='w-[20rem] md:w-[24rem] max-h-[70vh] p-4 md:p-6 py-6 md:py-8'>
                <div className='flex justify-center mb-6'>
                  <Logo size='medium' clickable={false} />
                </div>
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
                  {authComponent}
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AuthDialog
