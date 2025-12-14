import React, { useState, useEffect } from 'react'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { MediaSection } from '@/components/organisms/createPostSections/mediaSection'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { toast } from 'sonner'
import { Upload, CheckCircle2 } from 'lucide-react'
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
    media,
    updateMedia,
    videoUploadProgress,
    imagesUploadProgress,
    uploadPendingImages: uploadPendingImagesFromContext,
    clearPendingImages,
    resetImagesUploadProgress,
    pendingImages,
  } = useCreatePost()

  const [isMediaUploaded, setIsMediaUploaded] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Count uploaded images from media array - must be IMAGE type
  const uploadedImages = media.filter((m) => m.mediaType === 'IMAGE')
  const uploadedImagesCount = uploadedImages.length

  const pendingImagesCount = pendingImages.length
  const totalImagesCount = uploadedImagesCount + pendingImagesCount

  // Validation: Need at least 4 images including 1 cover (isPrimary)
  const canUpload = totalImagesCount >= 4 && pendingImagesCount > 0
  const isUploadDisabled =
    !canUpload || isUploading || videoUploadProgress.isUploading

  const handleMediaUpload = async () => {
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

    setIsUploading(true)

    try {
      // Upload all pending images
      const uploadedResults = await uploadPendingImagesFromContext()

      uploadedResults.forEach((img) => {
        updateMedia(img)
      })

      // Validate: must have at least 4 images including 1 cover (isPrimary)
      const allImages = [...media, ...uploadedResults].filter(
        (m) => m.mediaType === 'IMAGE',
      )
      const allImagesCount = allImages.length
      const hasCover = allImages.some((m) => m.isPrimary === true)

      if (allImagesCount < 4) {
        toast.error(
          t('validation.imagesMinimum') || 'At least 4 photos are required',
        )
        setIsUploading(false)
        setIsMediaUploaded(false)
        onValidationComplete?.(false)
        return false
      }

      if (!hasCover) {
        toast.error(
          t('validation.coverImageRequired') ||
            'Cover image (primary) is required',
        )
        setIsUploading(false)
        setIsMediaUploaded(false)
        onValidationComplete?.(false)
        return false
      }

      clearPendingImages()
      resetImagesUploadProgress()

      // Show success message
      toast.success(
        t('sections.media.upload.success') || 'Media uploaded successfully',
      )

      setIsMediaUploaded(true)
      setIsUploading(false)
      onValidationComplete?.(true)
      return true
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('sections.media.upload.failed') || 'Failed to upload media'
      toast.error(errorMessage)
      setIsUploading(false)
      setIsMediaUploaded(false)
      onValidationComplete?.(false)
      return false
    }
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__validateMediaStep = async () => {
      if (isMediaUploaded) {
        return true
      }

      if (pendingImages.length > 0) {
        toast.error(
          t('sections.media.validation.pendingImages') ||
            'Please upload pending images before proceeding',
        )
        return false
      }

      const uploadedImagesList = media.filter((m) => m.mediaType === 'IMAGE')
      const uploadedCount = uploadedImagesList.length
      const hasCover = uploadedImagesList.some((m) => m.isPrimary === true)

      if (uploadedCount < 4) {
        toast.error(
          t('validation.imagesMinimum') || 'At least 4 photos are required',
        )
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
  }, [isMediaUploaded, pendingImages.length, media, t])

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

        {/* Upload Media Button */}
        <div className='mt-6 flex flex-col gap-4'>
          {isMediaUploaded && (
            <Alert className='border-green-200 bg-green-50'>
              <CheckCircle2 className='h-4 w-4 text-green-600' />
              <AlertDescription className='text-green-800'>
                {t('sections.media.uploaded.success')}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type='button'
            onClick={handleMediaUpload}
            disabled={isUploadDisabled}
            className='w-full sm:w-auto'
            size='lg'
          >
            {isUploading ? (
              <>
                <Upload className='mr-2 h-4 w-4 animate-pulse' />
                {t('sections.media.upload.uploading')}
              </>
            ) : (
              <>
                <Upload className='mr-2 h-4 w-4' />
                {t('sections.media.uploadButton')}
              </>
            )}
          </Button>

          {!canUpload && pendingImagesCount > 0 && (
            <Typography variant='small' className='text-muted-foreground'>
              {t('validation.imagesMinimum')} ({totalImagesCount}/4)
            </Typography>
          )}

          {canUpload && !isMediaUploaded && (
            <Typography variant='small' className='text-muted-foreground'>
              {pendingImagesCount} {t('sections.media.upload.images')}
            </Typography>
          )}
        </div>
      </Card>
    </Card>
  )
}
