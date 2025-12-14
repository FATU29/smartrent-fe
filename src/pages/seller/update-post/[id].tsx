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
import { Loader2 } from 'lucide-react'
import { mapListingToFormData } from '@/utils/property/mapListingToFormData'

const UpdatePostPageContent = () => {
  const router = useRouter()
  const { id } = router.query
  const t = useTranslations('updatePost')
  const { updatePropertyInfo, updateFulltextAddress, setMedia } =
    useCreatePost()
  const hasLoadedRef = React.useRef(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [listingId, setListingId] = React.useState<string | null>(null)

  useEffect(() => {
    const fetchListing = async () => {
      if (!id || typeof id !== 'string' || !router.isReady) return
      if (hasLoadedRef.current && listingId === id) return

      hasLoadedRef.current = true
      setIsLoading(true)

      try {
        const { success, data } = await ListingService.getById(id)
        console.log('📡 Fetched listing from API:', {
          success,
          hasData: !!data,
          title: data?.title,
          description: data?.description?.substring(0, 50),
          postDate: data?.postDate,
          vipType: data?.vipType,
        })
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
        } else {
          hasLoadedRef.current = false
        }
      } catch (error) {
        console.error('❌ Error fetching listing:', error)
        hasLoadedRef.current = false
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [id, router.isReady])

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

  return <UpdatePostTemplate />
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
