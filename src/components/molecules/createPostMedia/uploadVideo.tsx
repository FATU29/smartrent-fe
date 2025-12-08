import React, { useRef } from 'react'
import { ENV } from '@/constants'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { Progress } from '@/components/atoms/progress'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { Video, Upload, X, Loader2 } from 'lucide-react'
import { MediaService } from '@/api/services'
import type { MediaItem } from '@/api/types/property.type'
import { toast } from 'sonner'

const MAX_VIDEO_SIZE_MB = ENV.MAX_VIDEO_SIZE_MB || 100
const MAX_VIDEO_SIZE = MAX_VIDEO_SIZE_MB * 1024 * 1024 // 100MB in bytes
const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
]

interface UploadVideoProps {
  video?: Partial<MediaItem>
}

const UploadVideo: React.FC<UploadVideoProps> = ({ video }) => {
  const t = useTranslations('createPost.sections.media')
  const {
    updateMedia,
    removeMedia,
    startVideoUpload,
    updateVideoUploadProgress,
    setVideoUploadError,
    resetVideoUploadProgress,
    videoUploadProgress,
  } = useCreatePost()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const videoFileRef = useRef<File | null>(null)

  const videoUrl = video?.url || ''

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate video format
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      toast.error(
        t('video.upload.invalidType') ||
          'Video format is not supported. Please use MP4, WebM, or OGG format.',
      )
      return
    }

    // Validate video size (100MB)
    if (file.size > MAX_VIDEO_SIZE) {
      toast.error(
        t('video.upload.tooLarge', { maxSize: MAX_VIDEO_SIZE_MB }) ||
          `Video size must not exceed ${MAX_VIDEO_SIZE_MB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      )
      return
    }

    if (videoFileRef.current && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl)
    }

    videoFileRef.current = file
    const blobUrl = URL.createObjectURL(file)
    updateMedia({
      url: blobUrl,
      mediaType: 'VIDEO',
      isPrimary: true,
    })

    await uploadVideo(file)
  }

  const uploadVideo = async (file: File) => {
    startVideoUpload(file.name)

    try {
      const response = await MediaService.upload(
        { file, mediaType: 'VIDEO', isPrimary: true },
        {
          onUploadProgress: (e) => {
            if (!e.total) return
            const pct = Math.round((e.loaded / e.total) * 100)
            updateVideoUploadProgress(pct)
          },
        },
      )

      const uploadedUrl = response?.data?.url
      const mediaId = response?.data?.mediaId
      if (uploadedUrl) {
        if (videoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(videoUrl)
        }
        updateMedia({
          url: uploadedUrl,
          mediaId: mediaId ? Number(mediaId) : undefined,
          mediaType: 'VIDEO',
          isPrimary: true,
          sourceType: 'UPLOADED',
        })
      }
      updateVideoUploadProgress(100)
      setTimeout(() => {
        resetVideoUploadProgress()
      }, 600)

      // Show success toast
      toast.success(t('video.upload.success') || 'Video uploaded successfully!')
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        t('video.upload.error') ||
        'Error uploading video'
      setVideoUploadError(errorMessage)

      // Show error toast
      toast.error(errorMessage)
    }
  }

  const handleRemoveVideo = () => {
    if (videoFileRef.current && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl)
      videoFileRef.current = null
    }

    // Remove video from media context
    if (video?.mediaId) {
      removeMedia(video.mediaId)
    }

    if (inputRef.current) {
      inputRef.current.value = ''
    }

    resetVideoUploadProgress()
  }

  // Determine video state based on sourceType and url
  const isBlobUrl = videoUrl.startsWith('blob:')
  const isExternalVideo = video?.sourceType === 'EXTERNAL'
  const isUploadedVideo =
    video?.sourceType === 'UPLOADED' && videoUrl && !isBlobUrl
  const showVideoPreview = videoUrl && (isBlobUrl || isUploadedVideo)

  return (
    <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg sm:text-xl flex items-center gap-2'>
          <Video className='w-4 h-4' />{' '}
          {t('video.upload.title') || 'Tải video lên'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isExternalVideo ? (
          <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'>
            <p className='text-sm text-gray-600 dark:text-gray-400 text-center'>
              {t('video.external.uploadedNote') ||
                'Bạn đã thêm link YouTube/TikTok. Xóa link để tải video lên.'}
            </p>
          </div>
        ) : !showVideoPreview ? (
          <>
            <input
              ref={inputRef}
              type='file'
              accept='video/*'
              onChange={handleFileChange}
              className='hidden'
              disabled={videoUploadProgress.isUploading}
            />
            <Button
              type='button'
              variant='outline'
              onClick={() => inputRef.current?.click()}
              disabled={videoUploadProgress.isUploading}
              className='w-full h-12 sm:h-12 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200'
            >
              {videoUploadProgress.isUploading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  {t('video.upload.uploading') || 'Đang tải lên...'}
                </>
              ) : (
                <>
                  <Upload className='w-4 h-4 mr-2' />
                  {t('video.upload.button') || 'Chọn video để tải lên'}
                </>
              )}
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
              {/* Disable delete button when uploading */}
              <Button
                type='button'
                variant='destructive'
                size='sm'
                onClick={handleRemoveVideo}
                disabled={videoUploadProgress.isUploading}
                className='absolute top-2 right-2'
              >
                <X className='w-4 h-4' />
              </Button>
            </div>

            {/* Show upload progress */}
            {videoUploadProgress.isUploading && (
              <div className='mb-3 space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>
                    {t('video.upload.uploading') || 'Đang tải lên...'}
                  </span>
                  <span className='font-medium'>
                    {videoUploadProgress.progress}%
                  </span>
                </div>
                <Progress
                  value={videoUploadProgress.progress}
                  className='h-2'
                />
              </div>
            )}

            {/* Show error if upload failed */}
            {videoUploadProgress.error && !videoUploadProgress.isUploading && (
              <Typography
                variant='small'
                className='mt-2 text-xs text-red-600 dark:text-red-400 text-center'
              >
                {videoUploadProgress.error}
              </Typography>
            )}

            {/* Show success message when uploaded */}
            {isUploadedVideo && !videoUploadProgress.isUploading && (
              <Typography
                variant='small'
                className='text-green-600 dark:text-green-400 text-center mt-2'
              >
                {t('video.upload.success') ||
                  'Video đã được tải lên thành công!'}
              </Typography>
            )}
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

export { UploadVideo }
