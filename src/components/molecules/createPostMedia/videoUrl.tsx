import React, { useState } from 'react'
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
import { isYouTube, toYouTubeEmbed } from '@/utils/video/url'
import { MediaService } from '@/api/services'
import { toast } from 'sonner'
import type { MediaItem } from '@/api/types/property.type'

interface VideoUrlProps {
  video?: Partial<MediaItem>
}

const VideoUrl: React.FC<VideoUrlProps> = ({ video }) => {
  const t = useTranslations('createPost.sections.media')
  const { updateMedia, resetMedia } = useCreatePost()

  const isExternalYouTubeVideo = video?.sourceType === 'EXTERNAL'
  const videoUrl = video?.url || ''
  const [url, setUrl] = useState<string>('')
  const [saving, setSaving] = useState(false)

  React.useEffect(() => {
    if (videoUrl && isExternalYouTubeVideo) {
      setUrl(videoUrl)
    } else if (!videoUrl) {
      setUrl('')
    }
  }, [videoUrl, isExternalYouTubeVideo])

  const isBlobUrl = videoUrl.startsWith('blob:')
  const isUploadedVideo =
    video?.sourceType === 'UPLOADED' && videoUrl && !isBlobUrl
  const hasExternalVideo = videoUrl && isExternalYouTubeVideo

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
        updateMedia({
          url: res.data.url,
          mediaId: res.data.mediaId ? Number(res.data.mediaId) : undefined,
          mediaType: 'VIDEO',
          isPrimary: true,
          sourceType: 'EXTERNAL',
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
    setUrl('')
    resetMedia()
  }

  return (
    <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg sm:text-xl flex items-center gap-2'>
          <Link2 className='w-4 h-4' /> {t('video.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isUploadedVideo ? (
          <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'>
            <p className='text-sm text-gray-600 dark:text-gray-400 text-center'>
              {t('video.upload.uploadedNote') ||
                'Bạn đã tải video lên. Xóa video để nhập link YouTube/TikTok.'}
            </p>
          </div>
        ) : hasExternalVideo ? (
          <div className='space-y-3'>
            <div className='relative w-full aspect-video rounded-lg overflow-hidden bg-black'>
              <iframe
                src={toYouTubeEmbed(videoUrl) || ''}
                className='w-full h-full'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                allowFullScreen
              />
            </div>
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
                <div className='relative w-full aspect-video rounded-lg overflow-hidden bg-black'>
                  <iframe
                    src={toYouTubeEmbed(url) || ''}
                    className='w-full h-full'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export { VideoUrl }
