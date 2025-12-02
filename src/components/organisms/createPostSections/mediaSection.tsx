import React from 'react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { UploadImages } from '@/components/molecules/createPostMedia/uploadImages'
import { CoverUpload } from '@/components/molecules/createPostMedia/coverUpload'
import { UploadVideo } from '@/components/molecules/createPostMedia/uploadVideo'
import { VideoUrl } from '@/components/molecules/createPostMedia/videoUrl'
import { PhotoGuidelines } from '@/components/molecules/createPostMedia/photoGuidelines'

interface MediaSectionProps {
  className?: string
  showHeader?: boolean
}

const MediaSection: React.FC<MediaSectionProps> = ({
  className,
  showHeader = true,
}) => {
  const t = useTranslations('createPost.sections.media')
  const { media } = useCreatePost()

  const coverImage = media.find(
    (img) => img.mediaType === 'IMAGE' && img.isPrimary === true,
  )

  const otherImages = media.filter(
    (img) => img.mediaType === 'IMAGE' && img.isPrimary === false,
  )

  // Video is always isPrimary and only 1 video allowed
  const video = media.find((item) => item.mediaType === 'VIDEO')
  const hasVideo = !!video

  // Show upload video if no video exists
  // Show video URL input if no video exists
  // Only one type can exist at a time
  const showUploadVideo = !hasVideo
  const showVideoUrl = !hasVideo

  return (
    <div className={className}>
      {showHeader && (
        <div className='mb-5 sm:mb-8'>
          <h2 className='text-xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3'>
            {t('title')}
          </h2>
          <p className='text-sm sm:text-base text-muted-foreground'>
            {t('description')}
          </p>
        </div>
      )}
      <CoverUpload coverImage={coverImage} />
      <UploadImages images={otherImages} />

      {/* Show video if exists */}
      {hasVideo && <UploadVideo video={video} />}

      {/* Show upload options only when no video exists */}
      {showUploadVideo && <UploadVideo video={undefined} />}
      {showVideoUrl && <VideoUrl video={undefined} />}

      <PhotoGuidelines />
    </div>
  )
}

export { MediaSection }
export type { MediaSectionProps }
