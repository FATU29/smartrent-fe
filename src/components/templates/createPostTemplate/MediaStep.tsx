import React, { useEffect } from 'react'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { MediaSection } from '@/components/organisms/createPostSections/mediaSection'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { useMediaLimits } from '@/hooks/usePostContext/useMediaLimits'
import { toast } from 'sonner'
import { Upload, Info } from 'lucide-react'
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
  const { media, propertyInfo, videoUploadProgress, imagesUploadProgress } =
    useCreatePost()
  const { minImages, maxImages, maxVideos, tier } = useMediaLimits(
    propertyInfo?.vipType,
  )

  // Count uploaded images from media array - must be IMAGE type
  const uploadedImages = media.filter((m) => m.mediaType === 'IMAGE')
  const uploadedImagesCount = uploadedImages.length
  const hasCover = uploadedImages.some((m) => m.isPrimary === true)
  const isMediaValid =
    uploadedImagesCount >= minImages &&
    uploadedImagesCount <= maxImages &&
    hasCover

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__validateMediaStep = async () => {
      if (videoUploadProgress.isUploading) {
        toast.error(
          t('validation.videoUploadInProgress') ||
            'Please wait for video upload to complete before continuing',
        )
        return false
      }

      if (imagesUploadProgress.isUploading) {
        toast.error(
          t('validation.imagesUploadInProgress') ||
            'Please wait for images upload to complete before continuing',
        )
        return false
      }

      if (uploadedImagesCount < minImages) {
        toast.error(t('validation.imagesMinimum', { min: minImages }))
        return false
      }

      if (uploadedImagesCount > maxImages) {
        toast.error(t('validation.imagesLimitReached', { max: maxImages }))
        return false
      }

      if (!hasCover) {
        toast.error(
          t('validation.coverImageRequired') ||
            'Cover image (primary) is required',
        )
        return false
      }

      return true
    }
  }, [
    hasCover,
    imagesUploadProgress.isUploading,
    t,
    uploadedImagesCount,
    videoUploadProgress.isUploading,
    minImages,
    maxImages,
  ])

  useEffect(() => {
    onValidationComplete?.(
      isMediaValid &&
        !imagesUploadProgress.isUploading &&
        !videoUploadProgress.isUploading,
    )
  }, [
    imagesUploadProgress.isUploading,
    isMediaValid,
    onValidationComplete,
    videoUploadProgress.isUploading,
  ])

  return (
    <Card
      className={`w-full mx-auto md:max-w-7xl border-0 shadow-none bg-transparent p-0 ${className || ''}`}
    >
      <Card className='border-0 shadow-none bg-transparent rounded-none p-0 sm:bg-card sm:rounded-lg sm:shadow-sm sm:border sm:p-8'>
        <Card className='mb-4 sm:mb-8 border-0 shadow-none bg-transparent p-0'>
          <Typography variant='pageTitle'>
            {t('sections.media.title')}
          </Typography>
        </Card>
        {tier && (
          <Alert className='mb-6 border-primary/50 bg-primary/10 text-foreground'>
            <Info className='h-5 w-5 text-primary' />
            <AlertDescription className='text-base font-semibold text-foreground'>
              {t('sections.media.tierLimits', {
                tierName: tier.tierName,
                min: minImages,
                max: maxImages,
                videos: maxVideos,
              })}
            </AlertDescription>
          </Alert>
        )}

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

        <div className='mt-6 flex flex-col gap-4'>
          {uploadedImagesCount < minImages && (
            <Typography variant='small' className='text-muted-foreground'>
              {t('validation.imagesMinimum', { min: minImages })} (
              {uploadedImagesCount}/{minImages})
            </Typography>
          )}

          {uploadedImagesCount > maxImages && (
            <Typography variant='small' className='text-destructive'>
              {t('validation.imagesLimitReached', { max: maxImages })}
            </Typography>
          )}

          {!hasCover && (
            <Typography variant='small' className='text-muted-foreground'>
              {t('validation.coverImageRequired')}
            </Typography>
          )}
        </div>
      </Card>
    </Card>
  )
}
