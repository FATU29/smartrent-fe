import React, { useEffect } from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import { UpdatePostTemplate } from '@/components/templates/updatePostTemplate'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import LocationProvider from '@/contexts/location'
import { CreatePostProvider, useCreatePost } from '@/contexts/createPost'
import { useRouter } from 'next/router'
import { ListingService } from '@/api/services/listing.service'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { Loader2 } from 'lucide-react'
import { mapListingToFormData } from '@/utils/property/mapListingToFormData'
import { ModerationBanner } from '@/components/molecules/moderation'
import { ModerationTimeline } from '@/components/molecules/moderation'
import {
  ModerationStatus,
  ModerationTimelineEvent,
  PendingOwnerAction,
  ResubmitNotAllowedError,
} from '@/api/types/property.type'
import { useResubmitListing } from '@/hooks/useListings/useResubmitListing'
import { toast } from 'sonner'

const UpdatePostPageContent = () => {
  const router = useRouter()
  const { id, resubmit } = router.query
  const t = useTranslations('updatePost')
  const tModeration = useTranslations('seller.moderation.resubmit')
  const { updatePropertyInfo, updateFulltextAddress, setMedia } =
    useCreatePost()
  const hasLoadedRef = React.useRef(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [listingId, setListingId] = React.useState<string | null>(null)
  const [fetchError, setFetchError] = React.useState(false)

  // Moderation state
  const [moderationStatus, setModerationStatus] = React.useState<
    ModerationStatus | undefined
  >(undefined)
  const [verificationNotes, setVerificationNotes] = React.useState<
    string | null
  >(null)
  const [pendingOwnerAction, setPendingOwnerAction] =
    React.useState<PendingOwnerAction | null>(null)
  const [moderationTimeline, setModerationTimeline] = React.useState<
    ModerationTimelineEvent[]
  >([])
  const [permanentlyRemoved, setPermanentlyRemoved] = React.useState(false)
  const isResubmitMode = resubmit === 'true'
  const resubmitMutation = useResubmitListing()

  useEffect(() => {
    const fetchListing = async () => {
      if (!id || typeof id !== 'string' || !router.isReady) return
      if (hasLoadedRef.current && listingId === id) return

      hasLoadedRef.current = true
      setIsLoading(true)
      setFetchError(false)

      try {
        // Owner-managed endpoint: unlike the public listing API, this returns
        // the listing regardless of moderation status (pending/rejected/etc.),
        // which is required while resubmitting, and enforces ownership itself.
        const { success, data } = await ListingService.getMyListingDetail(id)

        if (success && data) {
          const {
            propertyInfo: mappedPropertyInfo,
            fulltextAddress,
            media,
          } = mapListingToFormData(data)
          updatePropertyInfo(mappedPropertyInfo)
          updateFulltextAddress(fulltextAddress)
          setMedia(media)
          setListingId(id)
          setModerationStatus(data.moderationStatus)
          setVerificationNotes(data.verificationNotes || null)
          setPendingOwnerAction(data.pendingOwnerAction || null)
          setModerationTimeline(data.moderationTimeline || [])
          setPermanentlyRemoved(data.permanentlyRemoved || false)
        } else {
          hasLoadedRef.current = false
          setFetchError(true)
        }
      } catch (error) {
        console.error('❌ Error fetching listing:', error)
        hasLoadedRef.current = false
        setFetchError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [id, router.isReady])

  if (fetchError) {
    return (
      <Card className='w-full mx-auto md:container md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 border-0 shadow-none'>
        <CardContent className='flex flex-col items-center justify-center min-h-[400px] gap-4 text-center'>
          <Typography variant='sectionTitle'>
            {t('fetchError.title')}
          </Typography>
          <p className='text-muted-foreground'>{t('fetchError.description')}</p>
          <Button onClick={() => router.push('/seller/listings')}>
            {t('fetchError.backButton')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !listingId || !router.isReady) {
    return (
      <Card className='w-full mx-auto md:container md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 border-0 shadow-none'>
        <CardContent className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
          <p className='text-muted-foreground'>{t('loading')}</p>
        </CardContent>
      </Card>
    )
  }

  const handleResubmit = () => {
    if (!listingId) return
    resubmitMutation.mutate(
      { listingId },
      {
        onSuccess: () => {
          toast.success(tModeration('success'))
          router.push('/seller/listings')
        },
        onError: (err) => {
          toast.error(
            err instanceof ResubmitNotAllowedError
              ? tModeration('notAllowed')
              : err.message || tModeration('error'),
          )
        },
      },
    )
  }

  return (
    <div className='space-y-4'>
      {/* Moderation context banner */}
      {isResubmitMode && moderationStatus && (
        <ModerationBanner
          moderationStatus={moderationStatus}
          verificationNotes={verificationNotes}
          pendingOwnerAction={pendingOwnerAction}
          permanentlyRemoved={permanentlyRemoved}
          listingId={Number(listingId)}
          onResubmit={handleResubmit}
        />
      )}

      {/* Moderation timeline */}
      {isResubmitMode && moderationTimeline.length > 0 && (
        <ModerationTimeline events={moderationTimeline} />
      )}

      <UpdatePostTemplate />
    </div>
  )
}

const UpdatePostPage: NextPageWithLayout = () => {
  const t = useTranslations('updatePost')

  return (
    <>
      <SeoHead title={t('title')} noindex />
      <LocationProvider>
        <CreatePostProvider>
          <UpdatePostPageContent />
        </CreatePostProvider>
      </LocationProvider>
    </>
  )
}

UpdatePostPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default UpdatePostPage
