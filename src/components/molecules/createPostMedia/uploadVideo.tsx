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
    setVideoUploadProgress,
    videoUploadProgress,
  } = useCreatePost()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const videoFileRef = useRef<File | null>(null)

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
    if (videoFileRef.current && propertyInfo.videoUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(propertyInfo.videoUrl)
    }

    videoFileRef.current = file
    const videoUrl = URL.createObjectURL(file)
    updatePropertyInfo({ videoUrl })
    // Auto-upload after selection
    uploadVideo(file)
  }

  const uploadVideo = async (file: File) => {
    // Initialize upload progress
    setVideoUploadProgress({
      isUploading: true,
      progress: 0,
      fileName: file.name,
      error: null,
      uploadedUrl: null,
    })

    try {
      // Upload directly to backend endpoint
      const response = await MediaService.upload(
        { file, mediaType: 'VIDEO' },
        {
          onUploadProgress: (evt) => {
            if (evt.total) {
              const progress = Math.round((evt.loaded * 100) / evt.total)
              setVideoUploadProgress({ progress })
            }
          },
        },
      )

      const uploadedUrl = response?.data?.url
      setVideoUploadProgress({
        isUploading: false,
        progress: 100,
        uploadedUrl,
        error: null,
      })

      if (uploadedUrl) {
        if (propertyInfo.videoUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(propertyInfo.videoUrl)
        }
        updatePropertyInfo({ videoUrl: uploadedUrl })
      }
    } catch (error: unknown) {
      // Upload failed
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        t('video.upload.error') ||
        'Lỗi khi tải video lên'
      setVideoUploadProgress({
        isUploading: false,
        progress: 0,
        error: errorMessage,
      })
    }
  }

  const handleRemoveVideo = () => {
    if (videoFileRef.current && propertyInfo.videoUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(propertyInfo.videoUrl)
      videoFileRef.current = null
    }
    updatePropertyInfo({ videoUrl: '' })
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    if (videoFileRef.current) {
      uploadVideo(videoFileRef.current)
    }
  }

  // Check if videoUrl is a blob URL (from file upload)
  const isBlobUrl = propertyInfo.videoUrl?.startsWith('blob:')
  const hasPreviewVideo = Boolean(isBlobUrl && propertyInfo.videoUrl)
  const isUploadedUrl = Boolean(
    propertyInfo.videoUrl &&
      !propertyInfo.videoUrl.startsWith('blob:') &&
      propertyInfo.videoUrl.startsWith('http') &&
      !propertyInfo.videoUrl.includes('youtube.com') &&
      !propertyInfo.videoUrl.includes('youtu.be') &&
      !propertyInfo.videoUrl.includes('tiktok.com'),
  )
  const showUploadButton = hasPreviewVideo && !isUploadedUrl

  // Check if there's an external video link (disable upload)
  const hasExternalVideo = Boolean(
    propertyInfo.videoUrl &&
      (propertyInfo.videoUrl.includes('youtube.com') ||
        propertyInfo.videoUrl.includes('youtu.be') ||
        propertyInfo.videoUrl.includes('tiktok.com')),
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
                src={propertyInfo.videoUrl}
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
                onClick={handleUploadClick}
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
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

export { UploadVideo }
