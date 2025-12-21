import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import ImageAtom from '@/components/atoms/imageAtom'
import { DEFAULT_IMAGE } from '@/constants'
import { isYouTube, toYouTubeEmbed } from '@/utils/video/url'
import { MediaItem } from '@/api/types/property.type'

interface ImageSliderProps {
  media: MediaItem[]
}

const ImageSlider: React.FC<ImageSliderProps> = ({ media }) => {
  const t = useTranslations('apartmentDetail.imageSlider')

  const video = media.find((item) => item.mediaType === 'VIDEO' && item.url)
  const images = media.filter((item) => item.mediaType === 'IMAGE' && item.url)

  const thumbnailMedia = media.find(
    (item) => item.mediaType === 'IMAGE' && item.isPrimary && item.url,
  )

  const sortedMedia = [video, thumbnailMedia, ...images].filter(Boolean)

  const [currentIndex, setCurrentIndex] = useState(0)

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedMedia.length)
  }

  const prevMedia = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + sortedMedia.length) % sortedMedia.length,
    )
  }

  const selectMedia = (index: number) => {
    setCurrentIndex(index)
  }

  if (sortedMedia.length === 0) {
    return (
      <div className='relative w-full aspect-[16/9] rounded-xl md:rounded-2xl overflow-hidden bg-muted shadow-lg'>
        <ImageAtom
          src={DEFAULT_IMAGE}
          defaultImage={DEFAULT_IMAGE}
          alt={t('noMediaAvailable')}
          className='w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
          <span className='text-white text-sm md:text-base font-medium bg-black/70 px-5 py-2.5 rounded-lg '>
            {t('noMediaAvailable')}
          </span>
        </div>
      </div>
    )
  }

  const currentMedia = sortedMedia[currentIndex]

  return (
    <div className='space-y-3 md:space-y-4'>
      {/* Main Media Display */}
      <div className='relative w-full aspect-[16/9] rounded-xl md:rounded-2xl overflow-hidden bg-muted shadow-lg'>
        {currentMedia?.mediaType === 'IMAGE' ? (
          <ImageAtom
            src={currentMedia.url}
            defaultImage={DEFAULT_IMAGE}
            alt={`${t('image')} ${currentIndex + 1}`}
            className='w-full h-full object-cover'
          />
        ) : currentMedia?.mediaType === 'VIDEO' ? (
          isYouTube(currentMedia.url) ? (
            <div className='w-full h-full'>
              <iframe
                src={toYouTubeEmbed(currentMedia.url) || ''}
                className='w-full h-full'
                title={`video-${currentIndex + 1}`}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                allowFullScreen
              />
            </div>
          ) : (
            <video
              src={currentMedia.url}
              controls
              className='w-full h-full object-cover'
            />
          )
        ) : null}

        {/* Navigation Arrows */}
        {sortedMedia.length > 1 && (
          <>
            <Button
              variant='ghost'
              size='icon'
              className='absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full shadow-lg h-10 w-10 md:h-11 md:w-11  z-10 border border-gray-200/50'
              onClick={prevMedia}
            >
              <ChevronLeft className='w-5 h-5 md:w-6 md:h-6 text-gray-900' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full shadow-lg h-10 w-10 md:h-11 md:w-11  z-10  border border-gray-200/50'
              onClick={nextMedia}
            >
              <ChevronRight className='w-5 h-5 md:w-6 md:h-6 text-gray-900' />
            </Button>
          </>
        )}

        {/* Media Counter */}
        {sortedMedia.length > 1 && (
          <div className='absolute bottom-3 right-3 md:bottom-5 md:right-5 bg-black/75 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm backdrop-blur-md font-medium z-10'>
            {currentIndex + 1} / {sortedMedia.length}
          </div>
        )}

        {/* Video Badge */}
        {currentMedia?.mediaType === 'VIDEO' && (
          <div className='absolute top-3 left-3 md:top-5 md:left-5 bg-red-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 z-10'>
            <Play className='w-3 h-3 md:w-4 md:h-4' fill='currentColor' />
            {t('video')}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {sortedMedia.length > 1 && (
        <div className='flex gap-2 md:gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400'>
          {sortedMedia.map((item, index) => {
            const isYouTubeVideo =
              item?.mediaType === 'VIDEO' && isYouTube(item?.url || '')
            const thumbnailSrc = isYouTubeVideo
              ? DEFAULT_IMAGE
              : item?.url || ''

            return (
              <button
                key={index}
                className={`relative flex-shrink-0 w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-22 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentIndex
                    ? 'border-primary'
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => selectMedia(index)}
              >
                <ImageAtom
                  src={thumbnailSrc}
                  defaultImage={DEFAULT_IMAGE}
                  alt={`${item?.mediaType === 'VIDEO' ? t('video') : t('image')} ${index + 1}`}
                  className='w-full h-full object-cover'
                />
                {item?.mediaType === 'VIDEO' && (
                  <div className='absolute inset-0 bg-black/30 flex items-center justify-center'>
                    <div className='bg-white/95 rounded-full p-1.5 md:p-2'>
                      <Play
                        className='w-3 h-3 md:w-4 md:h-4 text-gray-900'
                        fill='currentColor'
                      />
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ImageSlider
