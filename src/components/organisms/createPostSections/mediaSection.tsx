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

  const video = media.find(
    (item) =>
      item.mediaType === 'VIDEO' &&
      item.isPrimary === true &&
      item.sourceType === 'YOUTUBE',
  )
  const hasVideoYoutube = !!video

  const uploadedVideo = media.find(
    (item) =>
      item.mediaType === 'VIDEO' &&
      item.isPrimary === true &&
      item.sourceType === 'UPLOAD',
  )
  const hasUploadedVideo = !!uploadedVideo

  // Only one video type can be present at a time
  const hasAnyVideo = hasVideoYoutube || hasUploadedVideo

  // Show upload video section only when no video exists
  const showUploadVideo = !hasAnyVideo

  // Show VideoUrl section only when no video exists OR when YouTube video exists
  const showVideoUrl = !hasUploadedVideo

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

      {/* Video Upload Section - Show when no video exists */}
      {showUploadVideo && <UploadVideo video={undefined} />}

      {/* Video URL Section - Always show (handles YouTube display and input) */}
      {showVideoUrl && <VideoUrl video={video || uploadedVideo} />}

      <PhotoGuidelines />
    </div>
  )
}

export { MediaSection }
export type { MediaSectionProps }
