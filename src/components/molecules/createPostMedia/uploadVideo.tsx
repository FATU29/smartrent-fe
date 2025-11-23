import React, { useRef, useState } from 'react'
import { ENV } from '@/constants'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { Video, Upload, X, CloudUpload } from 'lucide-react'
import { MediaService } from '@/api/services'

const MAX_VIDEO_SIZE_MB = ENV.MAX_VIDEO_SIZE_MB || 100
const MAX_VIDEO_SIZE = MAX_VIDEO_SIZE_MB * 1024 * 1024
const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
]

const UploadVideo: React.FC = () => {
  const t = useTranslations('createPost.sections.media')
  const {
    propertyInfo,
    updatePropertyInfo,
    startVideoUpload,
    updateVideoUploadProgress,
    setVideoUploadError,
    resetVideoUploadProgress,
    videoUploadProgress,
  } = useCreatePost()
  const inputRef = useRef<HTMLInputElement | null>(null)
  // Local state for preview only; uploading state moved to context
  const [showProgress, setShowProgress] = useState(false)
  const videoFileRef = useRef<File | null>(null)

  const videoUrl = propertyInfo?.assets?.video || ''

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      alert(
        t('video.upload.invalidType') || 'Định dạng video không được hỗ trợ',
      )
      return
    }

    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      alert(
        t('video.upload.tooLarge', { maxSize: MAX_VIDEO_SIZE_MB }) ||
          `Kích thước video không được vượt quá ${MAX_VIDEO_SIZE_MB}MB`,
      )
      return
    }

    // Clean up previous object URL if exists
    if (videoFileRef.current && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl)
    }

    videoFileRef.current = file
    const blobUrl = URL.createObjectURL(file)
    updatePropertyInfo({
      assets: {
        ...propertyInfo?.assets,
        video: blobUrl,
      },
    })
    // Do NOT auto-upload; wait for user to click explicit upload button
    resetVideoUploadProgress()
    setShowProgress(false)
  }

  const uploadVideo = async (file: File) => {
    startVideoUpload(file.name)
    setShowProgress(true)

    try {
      const response = await MediaService.upload(
        { file, mediaType: 'VIDEO' },
        {
          onUploadProgress: (e) => {
            if (!e.total) return
            const pct = Math.round((e.loaded / e.total) * 100)
            updateVideoUploadProgress(pct)
          },
        },
      )

      const uploadedUrl = response?.data?.url
      if (uploadedUrl) {
        if (videoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(videoUrl)
        }
        updatePropertyInfo({
          assets: {
            ...propertyInfo?.assets,
            video: uploadedUrl,
          },
        })
      }
      updateVideoUploadProgress(100)
      setTimeout(() => {
        resetVideoUploadProgress()
        setShowProgress(false)
      }, 600)
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        t('video.upload.error') ||
        'Lỗi khi tải video lên'
      setVideoUploadError(errorMessage)
    }
  }

  const handleRemoveVideo = () => {
    if (videoFileRef.current && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl)
      videoFileRef.current = null
    }
    updatePropertyInfo({
      assets: {
        ...propertyInfo?.assets,
        video: undefined,
      },
    })
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  // Check if videoUrl is a blob URL (from file upload)
  const isBlobUrl = videoUrl.startsWith('blob:')
  const hasPreviewVideo = Boolean(isBlobUrl && videoUrl)
  const isUploadedUrl = Boolean(
    videoUrl &&
      !videoUrl.startsWith('blob:') &&
      videoUrl.startsWith('http') &&
      !videoUrl.includes('youtube.com') &&
      !videoUrl.includes('youtu.be') &&
      !videoUrl.includes('tiktok.com'),
  )
  const showUploadButton = hasPreviewVideo && !isUploadedUrl

  // Check if there's an external video link (disable upload)
  const hasExternalVideo = Boolean(
    videoUrl &&
      (videoUrl.includes('youtube.com') ||
        videoUrl.includes('youtu.be') ||
        videoUrl.includes('tiktok.com')),
  )

  return (
    <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg sm:text-xl flex items-center gap-2'>
          <Video className='w-4 h-4' />{' '}
          {t('video.upload.title') || 'Tải video lên'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasExternalVideo ? (
          <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'>
            <p className='text-sm text-gray-600 dark:text-gray-400 text-center'>
              {t('video.external.uploadedNote') ||
                'Bạn đã thêm link YouTube/TikTok. Xóa link để tải video lên.'}
            </p>
          </div>
        ) : !hasPreviewVideo && !isUploadedUrl ? (
          <>
            <input
              ref={inputRef}
              type='file'
              accept='video/*'
              onChange={handleFileChange}
              className='hidden'
            />
            <Button
              type='button'
              variant='outline'
              onClick={() => inputRef.current?.click()}
              className='w-full h-12 sm:h-12 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200'
            >
              <Upload className='w-4 h-4 mr-2' />
              {t('video.upload.button') || 'Chọn video để tải lên'}
            </Button>
            <p className='text-xs sm:text-sm text-gray-500 mt-2'>
              {t('video.upload.help', { maxSize: MAX_VIDEO_SIZE_MB }) ||
                `Định dạng hỗ trợ: MP4, WebM, OGG. Kích thước tối đa: ${MAX_VIDEO_SIZE_MB}MB`}
            </p>
          </>
        ) : (
          <Card className='border-0 shadow-none p-0'>
            <div className='relative w-full rounded-lg overflow-hidden bg-black mb-3'>
              <video
                src={videoUrl}
                controls
                className='w-full max-h-96 object-contain'
              />
              <Button
                type='button'
                variant='destructive'
                size='sm'
                onClick={handleRemoveVideo}
                className='absolute top-2 right-2'
              >
                <X className='w-4 h-4' />
              </Button>
            </div>
            {showUploadButton && (
              <Button
                type='button'
                onClick={() =>
                  videoFileRef.current && uploadVideo(videoFileRef.current)
                }
                className='w-full h-12 bg-primary hover:bg-primary/90'
                disabled={videoUploadProgress.isUploading}
              >
                <CloudUpload className='w-4 h-4 mr-2' />
                {videoUploadProgress.isUploading
                  ? t('video.upload.uploading') || 'Đang tải lên...'
                  : t('video.upload.uploadButton') || 'Tải video lên'}
              </Button>
            )}
            {isUploadedUrl && (
              <Typography
                variant='small'
                className='text-green-600 dark:text-green-400 text-center mt-2'
              >
                {t('video.upload.success') ||
                  'Video đã được tải lên thành công!'}
              </Typography>
            )}
            {showProgress && videoUploadProgress.isUploading && (
              <div className='mt-4 w-full'>
                <div className='h-2 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden'>
                  <div
                    className='h-full bg-blue-500 dark:bg-blue-400 transition-all duration-200'
                    style={{ width: `${videoUploadProgress.progress}%` }}
                  />
                </div>
                <Typography
                  variant='small'
                  className='mt-2 text-xs text-gray-600 dark:text-gray-300 text-center'
                >
                  {videoUploadProgress.progress}%
                </Typography>
                {videoUploadProgress.error && (
                  <Typography
                    variant='small'
                    className='mt-2 text-xs text-red-600 dark:text-red-400 text-center'
                  >
                    {videoUploadProgress.error}
                  </Typography>
                )}
              </div>
            )}
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

export { UploadVideo }
