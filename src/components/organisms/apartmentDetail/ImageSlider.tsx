import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import ImageAtom from '@/components/atoms/imageAtom'
import { DEFAULT_IMAGE } from '@/constants'
import { isYouTube, toYouTubeEmbed } from '@/utils/video/url'
import { MediaItem } from '@/api/types/property.type'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/atoms/carousel'

interface ImageSliderProps {
  media: MediaItem[]
}

const ImageSlider: React.FC<ImageSliderProps> = ({ media }) => {
  const t = useTranslations('apartmentDetail.imageSlider')

  const sortedMedia = React.useMemo(() => {
    const video = media.find((item) => item.mediaType === 'VIDEO' && item.url)
    const thumbnailMedia = media.find(
      (item) => item.mediaType === 'IMAGE' && item.isPrimary && item.url,
    )
    const images = media.filter(
      (item) => item.mediaType === 'IMAGE' && item.url,
    )

    const merged = [video, thumbnailMedia, ...images].filter(
      Boolean,
    ) as MediaItem[]

    const seen = new Set<string>()
    return merged.filter((item) => {
      const key = `${item.mediaType}:${item.url}`
      if (!item.url || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [media])

  const [api, setApi] = React.useState<CarouselApi>()
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const nextMedia = () => api?.scrollNext()

  const prevMedia = () => api?.scrollPrev()

  const selectMedia = (index: number) => {
    setCurrentIndex(index)
    api?.scrollTo(index)
  }

  React.useEffect(() => {
    if (!api) return

    setCurrentIndex(api.selectedScrollSnap())

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap())
    }

    api.on('select', onSelect)
    api.on('reInit', onSelect)

    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  if (sortedMedia.length === 0) {
    return (
      <div className='relative w-full h-[240px] sm:h-[320px] md:h-[380px] rounded-xl overflow-hidden bg-muted shadow-md'>
        <ImageAtom
          src={DEFAULT_IMAGE}
          defaultImage={DEFAULT_IMAGE}
          alt={t('noMediaAvailable')}
          className='w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
          <span className='text-white text-xs md:text-sm font-medium bg-black/70 px-4 py-2 rounded-lg'>
            {t('noMediaAvailable')}
          </span>
        </div>
      </div>
    )
  }

  const currentMedia = sortedMedia[currentIndex]

  return (
    <div className='space-y-2.5 md:space-y-3'>
      {/* Main Media Display */}
      <div className='relative w-full rounded-xl overflow-hidden bg-muted shadow-md'>
        <Carousel
          setApi={setApi}
          opts={{ align: 'start', loop: sortedMedia.length > 1 }}
          className='w-full'
        >
          <CarouselContent className='ml-0'>
            {sortedMedia.map((item, index) => (
              <CarouselItem
                key={`${item.mediaType}-${item.url}-${index}`}
                className='pl-0'
              >
                <div className='relative w-full h-[240px] sm:h-[320px] md:h-[380px] overflow-hidden'>
                  {item.mediaType === 'IMAGE' ? (
                    <ImageAtom
                      src={item.url || DEFAULT_IMAGE}
                      defaultImage={DEFAULT_IMAGE}
                      alt={`${t('image')} ${index + 1}`}
                      className='w-full h-full object-cover'
                      priority={index === 0}
                    />
                  ) : isYouTube(item.url || '') ? (
                    <div className='w-full h-full'>
                      <iframe
                        src={toYouTubeEmbed(item.url || '') || ''}
                        className='w-full h-full'
                        title={`video-${index + 1}`}
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video
                      src={item.url}
                      controls
                      className='w-full h-full object-cover'
                    />
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Navigation Arrows */}
        {sortedMedia.length > 1 && (
          <>
            <Button
              variant='ghost'
              size='icon'
              className='absolute left-2 md:left-3 top-1/2 -translate-y-1/2 bg-card/95 hover:bg-card rounded-full shadow-md h-8 w-8 md:h-9 md:w-9 z-10 border border-border/50'
              onClick={prevMedia}
            >
              <ChevronLeft className='w-4 h-4 md:w-5 md:h-5 text-foreground' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-card/95 hover:bg-card rounded-full shadow-md h-8 w-8 md:h-9 md:w-9 z-10 border border-border/50'
              onClick={nextMedia}
            >
              <ChevronRight className='w-4 h-4 md:w-5 md:h-5 text-foreground' />
            </Button>
          </>
        )}

        {/* Video Badge */}
        {currentMedia?.mediaType === 'VIDEO' && (
          <div className='absolute top-2.5 left-2.5 md:top-3 md:left-3 bg-red-600 text-white px-2.5 py-1 md:px-3 md:py-1.5 rounded-md text-[11px] md:text-xs font-semibold flex items-center gap-1 z-10'>
            <Play className='w-3 h-3' fill='currentColor' />
            {t('video')}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {sortedMedia.length > 1 && (
        <div className='flex gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400'>
          {sortedMedia.map((item, index) => {
            const isYouTubeVideo =
              item?.mediaType === 'VIDEO' && isYouTube(item?.url || '')
            const thumbnailSrc = isYouTubeVideo
              ? DEFAULT_IMAGE
              : item?.url || ''

            return (
              <button
                key={index}
                className={`relative flex-shrink-0 w-14 h-12 sm:w-16 sm:h-14 md:w-20 md:h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                  index === currentIndex
                    ? 'border-primary'
                    : 'border-transparent hover:border-input'
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
                    <div className='bg-card/95 rounded-full p-1 md:p-1.5'>
                      <Play
                        className='w-2.5 h-2.5 md:w-3 md:h-3 text-foreground'
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
