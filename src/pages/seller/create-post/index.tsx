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
import { AlertTriangle, FileEdit } from 'lucide-react'
import React from 'react'

const CreatePostPage: NextPageWithLayout = () => {
  const router = useRouter()
  const rawDraftId = router.query.draftId
  const draftContextKey =
    typeof rawDraftId === 'string'
      ? rawDraftId
      : Array.isArray(rawDraftId)
        ? rawDraftId[0] || ''
        : ''
  const t = useTranslations('createPost.profilePhoneRequiredDialog')
  const tBlocked = useTranslations('createPost.blockedFromPostingDialog')
  const { user, isAuthenticated } = useAuth()
  const [openPhoneRequiredDialog, setOpenPhoneRequiredDialog] =
    React.useState(false)
  const [openBlockedDialog, setOpenBlockedDialog] = React.useState(false)

  const { data: profileResponse, isLoading: isCheckingProfile } = useQuery({
    queryKey: ['create-post-profile-phone-check', user?.userId],
    queryFn: () => UserService.getProfile(),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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

  const isPostingBlocked = React.useMemo(
    () =>
      Boolean(profileResponse?.data?.postingBlocked ?? user?.postingBlocked),
    [profileResponse?.data?.postingBlocked, user?.postingBlocked],
  )

  const blockedReason =
    profileResponse?.data?.postingBlockedReason ||
    user?.postingBlockedReason ||
    ''

  const handleRedirectToProfile = React.useCallback(() => {
    router.replace(SELLERNET_ROUTES.PERSONAL_EDIT)
  }, [router])

  React.useEffect(() => {
    if (isAuthenticated && !isCheckingProfile && !hasPhoneNumber) {
      setOpenPhoneRequiredDialog(true)
    }
  }, [hasPhoneNumber, isAuthenticated, isCheckingProfile])

  // Blocked users are told they cannot publish, but stay on the page so they
  // can still fill in the form and save it as a draft.
  React.useEffect(() => {
    if (isAuthenticated && !isCheckingProfile && isPostingBlocked) {
      setOpenBlockedDialog(true)
    }
  }, [isAuthenticated, isCheckingProfile, isPostingBlocked])

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
      <Dialog open={openBlockedDialog} onOpenChange={setOpenBlockedDialog}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{tBlocked('title')}</DialogTitle>
            <DialogDescription>{tBlocked('description')}</DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            {blockedReason && (
              <div className='flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4'>
                <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-destructive' />
                <div className='min-w-0'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-destructive'>
                    {tBlocked('reasonLabel')}
                  </p>
                  <p className='mt-1 text-sm text-foreground/90'>
                    {blockedReason}
                  </p>
                </div>
              </div>
            )}

            <div className='flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4'>
              <FileEdit className='mt-0.5 h-5 w-5 shrink-0 text-muted-foreground' />
              <p className='text-sm text-muted-foreground'>
                {tBlocked('draftNote')}
              </p>
            </div>

            <p className='text-sm text-muted-foreground'>
              {tBlocked.rich('contactSupport', {
                email: (chunks) => (
                  <a
                    href='mailto:smartrent.tools@gmail.com'
                    className='font-medium text-primary underline underline-offset-2'
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </div>

          <DialogFooter className='mt-6'>
            <Button onClick={() => setOpenBlockedDialog(false)}>
              {tBlocked('ok')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <LocationProvider>
        <CreatePostProvider key={draftContextKey || 'create-post-empty'}>
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
