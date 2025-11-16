import React from 'react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { X, Video, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'

export const VideoUploadProgress: React.FC = () => {
  const t = useTranslations('createPost.sections.media.video.upload')
  const { videoUploadProgress, resetVideoUploadProgress } = useCreatePost()

  if (
    !videoUploadProgress.isUploading &&
    !videoUploadProgress.error &&
    !videoUploadProgress.uploadedUrl
  ) {
    return null
  }

  const handleClose = () => {
    resetVideoUploadProgress()
  }

  const handleRetry = () => {
    resetVideoUploadProgress()
  }

  const isUploading = videoUploadProgress.isUploading
  const hasError = Boolean(videoUploadProgress.error)
  const isSuccess = Boolean(videoUploadProgress.uploadedUrl && !isUploading)

  const containerClassName = isUploading
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4'
    : 'fixed bottom-0 left-0 right-0 z-50 sm:bottom-4 sm:left-4 sm:right-auto sm:w-96 p-2 sm:p-0'

  return (
    <div className={containerClassName}>
      <Card
        className={`w-full ${
          isUploading
            ? 'max-w-md'
            : 'sm:max-w-md shadow-lg border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className='flex items-start gap-4 p-4 sm:p-6'>
          {/* Icon */}
          <div className='flex-shrink-0'>
            {isUploading ? (
              <Loader2 className='w-6 h-6 text-blue-500 animate-spin' />
            ) : hasError ? (
              <div className='relative'>
                <AlertCircle className='w-6 h-6 text-red-500' />
                <div className='absolute inset-0 bg-red-500/20 rounded-full blur-md' />
              </div>
            ) : (
              <div className='relative'>
                <CheckCircle2 className='w-6 h-6 text-green-500' />
                <div className='absolute inset-0 bg-green-500/20 rounded-full blur-md' />
              </div>
            )}
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between gap-2 mb-2'>
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                <Video className='w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0' />
                <Typography
                  variant='small'
                  className={`font-medium truncate ${
                    isUploading
                      ? 'text-base text-gray-900 dark:text-gray-100'
                      : 'text-sm text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {videoUploadProgress.fileName ||
                    t('title') ||
                    'Tải video lên'}
                </Typography>
              </div>
              {!isUploading && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleClose}
                  className='h-6 w-6 p-0 flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800'
                >
                  <X className='w-4 h-4' />
                </Button>
              )}
            </div>

            {/* Uploading Status */}
            {isUploading && (
              <div className='mt-2'>
                <Typography
                  variant='small'
                  className='text-gray-600 dark:text-gray-300 font-medium'
                >
                  {t('uploading') || 'Đang tải lên...'}
                </Typography>
              </div>
            )}

            {/* Error Message */}
            {hasError && (
              <div className='mt-3'>
                <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
                  <Typography
                    variant='small'
                    className='text-red-700 dark:text-red-400 font-medium mb-3'
                  >
                    {videoUploadProgress.error}
                  </Typography>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleRetry}
                    className='h-8 text-sm border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                  >
                    {t('retry') || 'Thử lại'}
                  </Button>
                </div>
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className='mt-3'>
                <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3'>
                  <Typography
                    variant='small'
                    className='text-green-700 dark:text-green-400 font-medium'
                  >
                    {t('success') || 'Tải video lên thành công!'}
                  </Typography>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
