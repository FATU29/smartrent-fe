import React from 'react'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { MediaSection } from '@/components/organisms/createPostSections/mediaSection'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { MediaService } from '@/api/services'
import { toast } from 'sonner'

interface MediaStepProps {
  className?: string
  onValidationComplete?: (success: boolean) => void
}

// Helper to upload all pending images
export const uploadPendingImages = async (): Promise<string[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coverPending = (window as any).__coverPendingImages || []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uploadPending = (window as any).__uploadPendingImages || []

  const allPending = [...coverPending, ...uploadPending]
  if (allPending.length === 0) return []

  const uploaded: string[] = []
  for (const pending of allPending) {
    try {
      const res = await MediaService.upload({
        file: pending.file,
        mediaType: 'IMAGE',
      })
      if (res?.success && res?.data?.url) {
        uploaded.push(res.data.url)
      } else {
        throw new Error('Upload failed')
      }
    } catch {
      throw new Error(`Failed to upload ${pending.file.name}`)
    }
  }

  return uploaded
}

export const MediaStep: React.FC<MediaStepProps> = ({
  className,
  onValidationComplete,
}) => {
  const t = useTranslations('createPost')
  const { propertyInfo, updatePropertyInfo, videoUploadProgress } =
    useCreatePost()

  // Expose validation method for parent
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__validateMediaStep = async () => {
      // Block navigation if video still uploading
      if (videoUploadProgress.isUploading) {
        return false
      }
      try {
        // Upload all pending images
        const newUrls = await uploadPendingImages()

        // Merge with existing uploaded images
        const existingImages = propertyInfo?.assets?.images || []
        const allImages = [...existingImages, ...newUrls]
        const hasVideo = !!propertyInfo?.assets?.video
        // Rule: pass if there is a video; else require >= 4 images
        if (!hasVideo && allImages.length < 4) {
          // No toast here; let parent show inline error like step 0
          return false
        }

        // Update context with uploaded images
        updatePropertyInfo({
          assets: {
            ...propertyInfo?.assets,
            images: allImages,
          },
        })

        // Clear pending state
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).__coverPendingImages = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).__uploadPendingImages = []

        onValidationComplete?.(true)
        return true
      } catch (error) {
        // Keep toast for actual upload failures
        toast.error(error instanceof Error ? error.message : 'Upload failed')
        onValidationComplete?.(false)
        return false
      } finally {
        // no image progress overlay anymore
      }
    }
  }, [
    propertyInfo,
    updatePropertyInfo,
    t,
    onValidationComplete,
    videoUploadProgress.isUploading,
  ])

  return (
    <Card
      className={`w-full mx-auto md:max-w-7xl border-0 shadow-none p-0 ${className || ''}`}
    >
      <Card className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
        <Card className='mb-6 sm:mb-8 border-0 shadow-none p-0'>
          <Typography
            variant='h2'
            className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3'
          >
            {t('sections.media.title')}
          </Typography>
          <Typography variant='muted' className='text-sm sm:text-base'>
            {t('sections.media.description')}
          </Typography>
        </Card>
        {/* Removed image uploading overlay per requirement; video progress handled separately */}
        <MediaSection className='w-full' showHeader={false} />
      </Card>
    </Card>
  )
}
