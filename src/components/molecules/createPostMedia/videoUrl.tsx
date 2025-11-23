import React, { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { Link2 } from 'lucide-react'
import VideoPlayerFull from '@/components/molecules/videoPlayerFull'
import { isYouTube } from '@/utils/video/url'
import { MediaService } from '@/api/services'
import { toast } from 'sonner'

const VideoUrl: React.FC = () => {
  const t = useTranslations('createPost.sections.media')
  const { propertyInfo, updatePropertyInfo } = useCreatePost()

  const videoUrl = propertyInfo?.assets?.video || ''
  const initial = useMemo(() => {
    const isBlob = videoUrl?.startsWith('blob:')
    return isBlob ? '' : videoUrl
  }, [videoUrl])

  const [url, setUrl] = useState<string>(initial)
  const [saving, setSaving] = useState(false)

  // Helpers
  // Check if there's already an uploaded video (blob or http uploaded file)
  const hasUploadedVideo = Boolean(
    videoUrl &&
      (videoUrl.startsWith('blob:') ||
        (videoUrl.startsWith('http') && !isYouTube(videoUrl))),
  )
  // Check if there's an external video link (YouTube only)
  const hasExternalVideo = Boolean(videoUrl && isYouTube(videoUrl))

  const onSave = async () => {
    if (!url || url.trim().length === 0) return
    if (!isYouTube(url)) {
      toast.error(
        t('video.external.onlyYoutube') || 'Chỉ chấp nhận liên kết YouTube',
      )
      return
    }
    try {
      setSaving(true)
      const res = await MediaService.saveExternal({ url: url.trim() })
      if (res?.success && res?.data) {
        updatePropertyInfo({
          assets: {
            ...propertyInfo?.assets,
            video: res.data.url,
          },
        })
        toast.success(t('video.external.success'))
      } else {
        toast.error(res?.message || t('video.external.error'))
      }
    } catch {
      toast.error(t('video.external.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = () => {
    updatePropertyInfo({
      assets: {
        ...propertyInfo?.assets,
        video: undefined,
      },
    })
    setUrl('')
  }

  return (
    <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg sm:text-xl flex items-center gap-2'>
          <Link2 className='w-4 h-4' /> {t('video.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasUploadedVideo ? (
          <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'>
            <p className='text-sm text-gray-600 dark:text-gray-400 text-center'>
              {t('video.upload.uploadedNote') ||
                'Bạn đã tải video lên. Xóa video để nhập link YouTube/TikTok.'}
            </p>
          </div>
        ) : hasExternalVideo ? (
          <div className='space-y-3'>
            <VideoPlayerFull src={videoUrl} aspectRatio='16/9' />
            <Button variant='outline' onClick={handleRemove} className='w-full'>
              Xóa video
            </Button>
          </div>
        ) : (
          <>
            {/* Placeholder when no input */}
            {!url && (
              <div className='mb-4 aspect-video w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600'>
                <div className='w-full h-full flex items-center justify-center'>
                  <div className='text-center space-y-2 p-4'>
                    <Link2 className='w-12 h-12 mx-auto text-gray-400' />
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      {t('video.placeholder')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className='flex flex-col sm:flex-row gap-3'>
              <input
                type='url'
                placeholder={t('video.placeholder')}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className='w-full h-12 sm:h-12 px-3 sm:px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm'
              />
              <Button
                onClick={onSave}
                disabled={saving || !url.trim()}
                className='shrink-0 h-12 sm:h-12 px-4'
              >
                {saving ? t('video.external.saving') : t('video.external.save')}
              </Button>
            </div>
            <p className='text-xs sm:text-sm text-gray-500 mt-2'>
              {t('video.help')}
            </p>
            {/* Live preview when input is a YouTube URL */}
            {url && isYouTube(url) && (
              <div className='mt-3'>
                <VideoPlayerFull src={url} aspectRatio='16/9' />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export { VideoUrl }
