import React from 'react'
import { useTranslations } from 'next-intl'
import { UploadImages } from '@/components/molecules/createPostMedia/uploadImages'
import { CoverUpload } from '@/components/molecules/createPostMedia/coverUpload'
import { UploadVideo } from '@/components/molecules/createPostMedia/uploadVideo'
import { VideoUploadProgress } from '@/components/molecules/createPostMedia/videoUploadProgress'
import { ImageUploadProgress } from '@/components/molecules/createPostMedia/imageUploadProgress'
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

  return (
    <>
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
        <CoverUpload />
        <UploadImages />
        <UploadVideo />
        <VideoUrl />
        <PhotoGuidelines />
      </div>
      <VideoUploadProgress />
      <ImageUploadProgress />
    </>
  )
}

export { MediaSection }
export type { MediaSectionProps }
