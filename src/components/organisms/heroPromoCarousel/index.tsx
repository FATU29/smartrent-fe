import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
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

  const handleOnClick = (link?: string) => {
    if (link) {
      router.push(link)
    }
  }

  return (
    <div className='relative rounded-xl overflow-hidden shadow-sm'>
      <Carousel
        className='group'
        opts={{ align: 'start', loop: true }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
          }),
        ]}
        setApi={setApi}
      >
        <CarouselContent className='-ml-0'>
          {slides.map((s) => (
            <CarouselItem key={s.id} className='pl-0'>
              <Link href={s.link || '#'}>
                <div className='relative h-[340px] sm:h-[420px] lg:h-[500px] w-full cursor-pointer'>
                  <Image
                    src={s.image}
                    alt={s.heading}
                    fill
                    className='object-contain'
                    priority={s.id === 'rentSecure'}
                    fetchPriority='high'
                    loading='eager'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10' />
                  <div className='absolute bottom-10 left-6 sm:left-10 max-w-xl text-white'>
                    <h2 className='text-2xl sm:text-4xl font-semibold tracking-tight mb-3'>
                      {s.heading}
                    </h2>
                    <p className='text-sm sm:text-base mb-5 leading-relaxed text-white/90'>
                      {s.sub}
                    </p>
                    {s.cta && s.id !== 'rentSecure' && (
                      <Button
                        variant='secondary'
                        size='sm'
                        className='backdrop-blur-sm'
                        onClick={() => handleOnClick(s.link || '#')}
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
