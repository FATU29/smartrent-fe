import React, { useEffect } from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import { UpdatePostTemplate } from '@/components/templates/updatePostTemplate'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import LocationProvider from '@/contexts/location'
import { UpdatePostProvider, useUpdatePost } from '@/contexts/updatePost'
import { CreatePostProvider } from '@/contexts/createPost'
import { UpdateToCreateBridge } from '@/components/templates/updatePostTemplate/components/UpdateToCreateBridge'
import { useRouter } from 'next/router'
import { ListingService } from '@/api/services/listing.service'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/atoms/card'
import { Loader2 } from 'lucide-react'

const UpdatePostPageContent = () => {
  const router = useRouter()
  const { id } = router.query
  const t = useTranslations('updatePost')
  const { loadListingIntoForm, listingId } = useUpdatePost()
  const hasLoadedRef = React.useRef(false)

  useEffect(() => {
    const fetchListing = async () => {
      // Prevent loading the same listing multiple times
      if (!id || typeof id !== 'string' || !router.isReady) return
      if (hasLoadedRef.current && listingId === id) return

      hasLoadedRef.current = true

      try {
        const { success, data, message } = await ListingService.getById(id)
        if (success && data) {
          await loadListingIntoForm(data)
        } else {
          console.error('Failed to load listing:', message)
          hasLoadedRef.current = false // Reset on error so we can retry
          // Optionally redirect to listings page on error
        }
      } catch (error) {
        console.error('Error fetching listing:', error)
        hasLoadedRef.current = false // Reset on error so we can retry
      }
    }

    fetchListing()
  }, [id, router.isReady, listingId]) // Only re-run if id or router state changes

  // Show loading state while fetching listing data
  if (!listingId || !router.isReady) {
    return (
      <Card className='w-full mx-auto md:container md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 border-0 shadow-none'>
        <CardContent className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
          <p className='text-muted-foreground'>{t('loading')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <CreatePostProvider>
      <UpdateToCreateBridge>
        <UpdatePostTemplate />
      </UpdateToCreateBridge>
    </CreatePostProvider>
  )
}

const UpdatePostPage: NextPageWithLayout = () => {
  const t = useTranslations('updatePost')

  return (
    <>
      <SeoHead title={t('title')} noindex />
      <LocationProvider>
        <UpdatePostProvider>
          <UpdatePostPageContent />
        </UpdatePostProvider>
      </LocationProvider>
    </>
  )
}

UpdatePostPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default UpdatePostPage
