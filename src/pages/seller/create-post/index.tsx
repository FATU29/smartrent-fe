import type { NextPageWithLayout } from '@/types/next-page'
import { CreatePostTemplate } from '@/components/templates/createPostTemplate'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import LocationProvider from '@/contexts/location'
import { CreatePostProvider } from '@/contexts/createPost'
import { CreatePostDraftGuard } from '@/components/molecules/createPostDraftGuard'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { UserService } from '@/api/services/user.service'
import { useAuth } from '@/hooks/useAuth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { SELLERNET_ROUTES } from '@/constants/route'
import React from 'react'

const CreatePostPage: NextPageWithLayout = () => {
  const router = useRouter()
  const t = useTranslations('createPost.profilePhoneRequiredDialog')
  const { user, isAuthenticated } = useAuth()
  const [openPhoneRequiredDialog, setOpenPhoneRequiredDialog] =
    React.useState(false)

  const { data: profileResponse, isLoading: isCheckingProfile } = useQuery({
    queryKey: ['create-post-profile-phone-check'],
    queryFn: () => UserService.getProfile(),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  })

  const hasPhoneNumber = React.useMemo(() => {
    const profile = profileResponse?.data
    const phone =
      profile?.contactPhoneNumber ||
      profile?.phoneNumber ||
      user?.contactPhoneNumber ||
      user?.phoneNumber ||
      ''
    return Boolean(phone.trim())
  }, [profileResponse?.data, user?.contactPhoneNumber, user?.phoneNumber])

  const handleRedirectToProfile = React.useCallback(() => {
    router.replace(SELLERNET_ROUTES.PERSONAL_EDIT)
  }, [router])

  React.useEffect(() => {
    if (isAuthenticated && !isCheckingProfile && !hasPhoneNumber) {
      setOpenPhoneRequiredDialog(true)
    }
  }, [hasPhoneNumber, isAuthenticated, isCheckingProfile])

  const handleDialogOpenChange = (nextOpen: boolean) => {
    setOpenPhoneRequiredDialog(nextOpen)
    if (!nextOpen) {
      handleRedirectToProfile()
    }
  }

  return (
    <>
      <SeoHead title='Đăng tin – Seller' noindex />
      <Dialog
        open={openPhoneRequiredDialog}
        onOpenChange={handleDialogOpenChange}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleRedirectToProfile}>{t('ok')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <LocationProvider>
        <CreatePostProvider>
          <CreatePostDraftGuard>
            <CreatePostTemplate />
          </CreatePostDraftGuard>
        </CreatePostProvider>
      </LocationProvider>
    </>
  )
}

CreatePostPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default CreatePostPage
