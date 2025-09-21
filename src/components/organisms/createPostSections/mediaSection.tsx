import React from 'react'
import { useTranslations } from 'next-intl'
import { UploadImages } from '@/components/molecules/createPostMedia/uploadImages'
import { VideoUrl } from '@/components/molecules/createPostMedia/videoUrl'
import { PhotoGuidelines } from '@/components/molecules/createPostMedia/photoGuidelines'

interface MediaSectionProps {
  className?: string
}

const MediaSection: React.FC<MediaSectionProps> = ({ className }) => {
  const t = useTranslations('createPost.sections.media')

  return (
    <div className={className}>
      <div className='mb-5 sm:mb-8'>
        <h2 className='text-xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3'>
          {t('title')}
        </h2>
        <p className='text-sm sm:text-base text-muted-foreground'>
          {t('description')}
        </p>
      </div>
      <UploadImages />
      <VideoUrl />
      <PhotoGuidelines />
    </div>
  )
}

export { MediaSection }
export type { MediaSectionProps }
