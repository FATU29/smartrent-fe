import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/atoms/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { cn } from '@/lib/utils'
import { OPEN_AI_CHAT_WIDGET_EVENT } from '@/constants/events'

interface Slide {
  id: string
  image: string
  heading: string
  sub: string
  cta?: string
  link?: string
}

const HeroPromoCarousel = () => {
  const t = useTranslations('homePage.heroSlides')
  const router = useRouter()
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  const slides: Slide[] = [
    {
      id: 'rentSecure',
      image: '/images/thue-phong-tro.jpg',
      heading: t('rentSecure.heading'),
      sub: t('rentSecure.sub'),
      cta: t('rentSecure.cta'),
      link: '#top-interest',
    },
    {
      id: 'smartSearch',
      image: '/images/tiem-kiem-tro.png',
      heading: t('smartSearch.heading'),
      sub: t('smartSearch.sub'),
      cta: t('smartSearch.cta'),
      link: '/properties',
    },
    {
      id: 'aiAssist',
      image: '/images/tim-kiem-tro-ai.jpg',
      heading: t('aiAssist.heading'),
      sub: t('aiAssist.sub'),
      cta: t('aiAssist.cta'),
    },
  ]

  React.useEffect(() => {
    if (!api) return

    setScrollSnaps(api.scrollSnapList())
    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })

    api.on('reInit', () => {
      setScrollSnaps(api.scrollSnapList())
    })
  }, [api])

  const handleOnClick = (e: React.MouseEvent, slide: Slide) => {
    if (slide.id === 'aiAssist') {
      e.preventDefault()
      e.stopPropagation()
      window.dispatchEvent(new CustomEvent(OPEN_AI_CHAT_WIDGET_EVENT))
      return
    }

    if (slide.link) {
      router.push(slide.link)
    }
  }

  const carouselImageSizes =
    '(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), (max-width: 1344px) calc(100vw - 4rem), 1280px'

  return (
    <div className='relative rounded-xl overflow-hidden shadow-sm'>
      <Carousel
        className='group'
        opts={{ align: 'start', loop: false }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
            stopOnLastSnap: true,
          }),
        ]}
        setApi={setApi}
      >
        <CarouselContent className='-ml-0'>
          {slides.map((s) => (
            <CarouselItem key={s.id} className='pl-0'>
              <Link
                href={s.link || '#'}
                onClick={(e) => {
                  if (s.id === 'aiAssist') {
                    handleOnClick(e, s)
                  }
                }}
              >
                <div className='relative h-[340px] sm:h-[420px] lg:h-[500px] w-full cursor-pointer'>
                  <Image
                    src={s.image}
                    alt={s.heading}
                    fill
                    className='object-cover object-top'
                    priority={s.id === 'rentSecure'}
                    quality={85}
                    sizes={carouselImageSizes}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10' />
                  <div className='absolute bottom-10 left-6 sm:left-10 max-w-xl text-white'>
                    <Typography variant='pageTitle' as='h2' className='mb-3'>
                      {s.heading}
                    </Typography>
                    <p className='text-sm sm:text-base mb-5 leading-relaxed text-white/90'>
                      {s.sub}
                    </p>
                    {s.cta && s.id !== 'rentSecure' && (
                      <Button
                        variant='secondary'
                        size='sm'
                        className='backdrop-blur-sm'
                        onClick={(e) => handleOnClick(e, s)}
                      >
                        {s.cta}
                      </Button>
                    )}
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Indicators */}
        <div className='absolute bottom-4 left-0 w-full flex justify-center gap-2'>
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type='button'
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                current === index
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75',
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  )
}

export default HeroPromoCarousel
