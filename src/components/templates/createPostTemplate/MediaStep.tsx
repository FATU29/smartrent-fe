import React from 'react'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { MediaSection } from '@/components/organisms/createPostSections/mediaSection'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/atoms/alert'
import { Progress } from '@/components/atoms/progress'

interface MediaStepProps {
  className?: string
  onValidationComplete?: (success: boolean) => void
}

export const MediaStep: React.FC<MediaStepProps> = ({
  className,
  onValidationComplete,
}) => {
  const t = useTranslations('createPost')
  const {
    mediaUrls,
    updateMediaUrls,
    updateMediaIds,
    videoUploadProgress,
    imagesUploadProgress,
    uploadPendingImages: uploadPendingImagesFromContext,
    clearPendingImages,
    resetImagesUploadProgress,
  } = useCreatePost()

  // Expose validation method for parent - auto upload pending images
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__validateMediaStep = async () => {
      // Block navigation if video still uploading
      if (videoUploadProgress.isUploading) {
        return false
      }

      try {
        // Upload all pending images if any
        const uploadedResults = await uploadPendingImagesFromContext()

        // Extract URLs and mediaIds
        const newUrls = uploadedResults.map((r) => r.url)
        const firstImageMediaId = uploadedResults[0]?.mediaId

        // Merge with existing uploaded images
        const existingImages = mediaUrls?.images || []
        const allImages = [...existingImages, ...newUrls]
        const hasVideo = !!mediaUrls?.video

        // Rule: pass if there is a video; else require >= 4 images
        if (!hasVideo && allImages.length < 4) {
          toast.error(t('sections.media.validation.minImages'))
          onValidationComplete?.(false)
          return false
        }

        // Update context with uploaded images
        if (newUrls.length > 0) {
          updateMediaUrls({ images: allImages })

          // Save thumbnail mediaId (index 1 in mediaIds array) from first image (cover)
          // Thumbnail is always from the first image in the images array (cover image)
          // If this is the first batch of images, use the first uploaded image's mediaId
          // If images already exist, keep the existing thumbnailMediaId (from first existing image)
          if (firstImageMediaId && existingImages.length === 0) {
            // This is the first batch - set thumbnailMediaId from first uploaded image
            const thumbnailMediaId = Number(firstImageMediaId)
            if (!isNaN(thumbnailMediaId) && thumbnailMediaId > 0) {
              updateMediaIds({ thumbnailMediaId })
            }
          }
          // If existingImages.length > 0, thumbnailMediaId should already be set from the first existing image
          // We don't update it when adding more images
        }

        // Clear pending images and reset progress
        clearPendingImages()
        resetImagesUploadProgress()

        onValidationComplete?.(true)
        return true
      } catch (error) {
        // Show error for actual upload failures
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed'
        toast.error(errorMessage)
        onValidationComplete?.(false)
        return false
      }
    }
  }, [
    mediaUrls,
    updateMediaUrls,
    updateMediaIds,
    onValidationComplete,
    videoUploadProgress.isUploading,
    uploadPendingImagesFromContext,
    clearPendingImages,
    resetImagesUploadProgress,
    t,
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
        {/* Images upload progress indicator */}
        {imagesUploadProgress.isUploading && (
          <Alert className='mb-6'>
            <Upload className='h-4 w-4' />
            <AlertDescription>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>
                    {t('sections.media.upload.uploading')}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {imagesUploadProgress.uploadedCount} /{' '}
                    {imagesUploadProgress.totalCount}{' '}
                    {t('sections.media.upload.images')}
                  </span>
                </div>
                <Progress
                  value={
                    imagesUploadProgress.totalCount > 0
                      ? (imagesUploadProgress.uploadedCount /
                          imagesUploadProgress.totalCount) *
                        100
                      : 0
                  }
                  className='h-2'
                />
              </div>
            </AlertDescription>
          </Alert>
        )}
        <MediaSection className='w-full' showHeader={false} />
      </Card>
    </Card>
  )
}
