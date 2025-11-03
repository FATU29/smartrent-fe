import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import ImageAtom from '@/components/atoms/imageAtom'
import { DEFAULT_IMAGE } from '@/constants'
import { VideoPlayerFull } from '@/components/molecules'

interface MediaItem {
  type: 'image' | 'video'
  src: string
  thumbnail?: string
}

interface ImageSliderProps {
  images: string[]
  videoTour?: string
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, videoTour }) => {
  const t = useTranslations('apartmentDetail.imageSlider')
  const [currentIndex, setCurrentIndex] = useState(0)

  // Create media items array
  const mediaItems: MediaItem[] = [
    ...images.map((img) => ({ type: 'image' as const, src: img })),
    ...(videoTour
      ? [
          {
            type: 'video' as const,
            src: videoTour,
            thumbnail: images[0] || DEFAULT_IMAGE,
          },
        ]
      : []),
  ]

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length)
  }

  const prevMedia = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + mediaItems.length) % mediaItems.length,
    )
  }

  const selectMedia = (index: number) => {
    setCurrentIndex(index)
  }

  if (mediaItems.length === 0) {
    return (
      <div className='w-full aspect-[16/10] bg-gray-200 rounded-xl flex items-center justify-center'>
        <span className='text-gray-500 text-sm'>{t('noMediaAvailable')}</span>
      </div>
    )
  }

  const currentMedia = mediaItems[currentIndex]

  return (
    <div className='space-y-4'>
      {/* Main Media Display */}
      <div className='relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-gray-900 shadow-lg'>
        {currentMedia.type === 'image' ? (
          <ImageAtom
            src={currentMedia.src}
            defaultImage={DEFAULT_IMAGE}
            alt={`${t('image')} ${currentIndex + 1}`}
            className='w-full h-full object-cover object-center'
          />
        ) : (
          <VideoPlayerFull
            src={currentMedia.src}
            poster={currentMedia.thumbnail}
            className='w-full h-full rounded-none'
            aspectRatio='16/9'
          />
        )}

        {/* Navigation Arrows */}
        {mediaItems.length > 1 && currentMedia.type === 'image' && (
          <>
            <Button
              variant='ghost'
              size='icon'
              className='absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm rounded-full shadow-lg h-10 w-10 transition-all duration-200 z-10'
              onClick={prevMedia}
            >
              <ChevronLeft className='w-5 h-5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm rounded-full shadow-lg h-10 w-10 transition-all duration-200 z-10'
              onClick={nextMedia}
            >
              <ChevronRight className='w-5 h-5' />
            </Button>
          </>
        )}

        {/* Media Counter */}
        {mediaItems.length > 1 && (
          <div className='absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm backdrop-blur-sm font-medium z-10'>
            {currentIndex + 1} {t('of')} {mediaItems.length}
          </div>
        )}

        {/* Media Type Badge */}
        {currentMedia.type === 'video' && (
          <div className='absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 z-10'>
            <Play className='w-3 h-3' fill='currentColor' />
            {t('video')}
          </div>
        )}
      </div>

      {/* Thumbnail List */}
      {mediaItems.length > 1 && (
        <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400'>
          {mediaItems.map((media, index) => (
            <button
              key={index}
              className={`relative flex-shrink-0 w-20 h-16 sm:w-24 sm:h-18 md:w-28 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? 'border-primary shadow-md ring-2 ring-primary/30'
                  : 'border-gray-200 hover:border-primary/50 opacity-80 hover:opacity-100'
              }`}
              onClick={() => selectMedia(index)}
            >
              <ImageAtom
                src={media.type === 'video' ? media.thumbnail! : media.src}
                defaultImage={DEFAULT_IMAGE}
                alt={`${media.type === 'video' ? t('video') : t('image')} ${index + 1}`}
                className='w-full h-full object-cover object-center'
              />
              {media.type === 'video' && (
                <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
                  <div className='bg-white/90 rounded-full p-1.5 sm:p-2'>
                    <Play
                      className='w-3 h-3 sm:w-4 sm:h-4 text-gray-900'
                      fill='currentColor'
                    />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageSlider
