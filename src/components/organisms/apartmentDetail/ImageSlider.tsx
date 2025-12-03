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
      <div className='group relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-gray-900 shadow-lg'>
        <ImageAtom
          src={DEFAULT_IMAGE}
          defaultImage={DEFAULT_IMAGE}
          alt={t('noMediaAvailable')}
          className='w-full h-full object-cover object-center'
        />
        <div className='absolute inset-0 bg-black/30 flex items-center justify-center'>
          <span className='text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm'>
            {t('noMediaAvailable')}
          </span>
        </div>
      </div>
    )
  }

  const currentMedia = sortedMedia[currentIndex]

  return (
    <div className='space-y-4'>
      {/* Main Media Display */}
      <div className='relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-gray-900 shadow-lg'>
        {currentMedia?.mediaType === 'IMAGE' ? (
          <ImageAtom
            src={currentMedia.url}
            defaultImage={DEFAULT_IMAGE}
            alt={`${t('image')} ${currentIndex + 1}`}
            className='w-full h-full object-cover object-center'
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
              className='w-full h-full object-cover object-center rounded-none'
            />
          )
        ) : null}

        {/* Navigation Arrows */}
        {sortedMedia.length > 1 && (
          <>
            <Button
              variant='ghost'
              size='icon'
              className='absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm rounded-full shadow-lg h-10 w-10 transition-all duration-200 z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
              onClick={prevMedia}
            >
              <ChevronLeft className='w-5 h-5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm rounded-full shadow-lg h-10 w-10 transition-all duration-200 z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
              onClick={nextMedia}
            >
              <ChevronRight className='w-5 h-5' />
            </Button>
          </>
        )}

        {/* Media Counter */}
        {sortedMedia.length > 1 && (
          <div className='absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm backdrop-blur-sm font-medium z-10 opacity-0 group-hover:opacity-100'>
            {currentIndex + 1} {t('of')} {sortedMedia.length}
          </div>
        )}

        {/* Media Type Badge */}
        {currentMedia?.mediaType === 'VIDEO' && (
          <div className='absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 z-10'>
            <Play className='w-3 h-3' fill='currentColor' />
            {t('video')}
          </div>
        )}
      </div>

      {/* Thumbnail List */}
      {sortedMedia.length > 1 && (
        <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400'>
          {sortedMedia.map((item, index) => {
            const isYouTubeVideo =
              item?.mediaType === 'VIDEO' && isYouTube(item?.url || '')
            const thumbnailSrc = isYouTubeVideo
              ? DEFAULT_IMAGE
              : item?.url || ''

            return (
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
                  src={thumbnailSrc}
                  defaultImage={DEFAULT_IMAGE}
                  alt={`${item?.mediaType === 'VIDEO' ? t('video') : t('image')} ${index + 1}`}
                  className='w-full h-full object-cover object-center'
                />
                {item?.mediaType === 'VIDEO' && (
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
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ImageSlider
