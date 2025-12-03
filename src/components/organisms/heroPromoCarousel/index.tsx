import React from 'react'
import Carousel from '@/components/atoms/carousel'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'

interface Slide {
  id: string
  image: string
  heading: string
  sub: string
  cta?: string
}

const HeroPromoCarousel: React.FC<{ onCTAClick?: (id: string) => void }> = ({
  onCTAClick,
}) => {
  const t = useTranslations('homePage.heroSlides')
  const slides: Slide[] = [
    {
      id: 'rentSecure',
      image: '/images/rental-auth-bg.jpg',
      heading: t('rentSecure.heading'),
      sub: t('rentSecure.sub'),
      cta: t('rentSecure.cta'),
    },
    {
      id: 'smartSearch',
      image: '/images/example.png',
      heading: t('smartSearch.heading'),
      sub: t('smartSearch.sub'),
      cta: t('smartSearch.cta'),
    },
    {
      id: 'aiAssist',
      image: '/images/default-image.jpg',
      heading: t('aiAssist.heading'),
      sub: t('aiAssist.sub'),
      cta: t('aiAssist.cta'),
    },
  ]

  return (
    <div className='relative rounded-xl overflow-hidden shadow-sm'>
      <Carousel.Root
        className='group'
        options={{ align: 'start' }}
        loop
        autoplay={{ delay: 5000, stopOnInteraction: true }}
      >
        {slides.map((s) => (
          <Carousel.Item key={s.id} className='pl-0 flex-[0_0_100%]'>
            <div className='relative h-[340px] sm:h-[420px] lg:h-[500px] w-full'>
              <Image
                src={s.image}
                alt={s.heading}
                fill
                className='object-cover'
                priority={s.id === 'rentSecure'}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10' />
              <div className='absolute bottom-10 left-6 sm:left-10 max-w-xl text-white'>
                <h2 className='text-2xl sm:text-4xl font-semibold tracking-tight mb-3'>
                  {s.heading}
                </h2>
                <p className='text-sm sm:text-base mb-5 leading-relaxed text-white/90'>
                  {s.sub}
                </p>
                {s.cta && (
                  <Button
                    variant='secondary'
                    size='sm'
                    className='backdrop-blur-sm'
                    onClick={() => onCTAClick?.(s.id)}
                  >
                    {s.cta}
                  </Button>
                )}
              </div>
            </div>
          </Carousel.Item>
        ))}
        <Carousel.Indicators className='absolute bottom-4 left-0 w-full' />
      </Carousel.Root>
    </div>
  )
}

export default HeroPromoCarousel
