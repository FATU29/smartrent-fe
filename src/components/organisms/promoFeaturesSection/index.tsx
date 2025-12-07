import React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/atoms/carousel'
import { useTranslations } from 'next-intl'
import { Home, Key, Building2, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureItem {
  id: string
  icon: React.ReactNode
  title: string
  description: string
}

const PromoFeaturesSection: React.FC = () => {
  const t = useTranslations('homePage.features')
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  const items: FeatureItem[] = [
    {
      id: 'buyOrRent',
      icon: <Home className='h-16 w-16 text-primary' strokeWidth={1.4} />,
      title: t('buyOrRent.title'),
      description: t('buyOrRent.desc'),
    },
    {
      id: 'rentals',
      icon: <Key className='h-16 w-16 text-primary' strokeWidth={1.4} />,
      title: t('rentals.title'),
      description: t('rentals.desc'),
    },
    {
      id: 'projectReview',
      icon: <Building2 className='h-16 w-16 text-primary' strokeWidth={1.4} />,
      title: t('projectReview.title'),
      description: t('projectReview.desc'),
    },
    {
      id: 'knowledge',
      icon: <Brain className='h-16 w-16 text-primary' strokeWidth={1.4} />,
      title: t('knowledge.title'),
      description: t('knowledge.desc'),
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

  return (
    <section className='mt-16'>
      <div className='relative rounded-2xl border bg-gradient-to-b from-background to-background/70 dark:from-background/60 dark:to-background/20 p-6 sm:p-10 overflow-hidden'>
        <div className='pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_50%_40%,black,transparent_75%)]'>
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.08),transparent_60%)]' />
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,hsl(var(--primary)/0.06),transparent_65%)]' />
        </div>
        <h2 className='relative text-center text-xl sm:text-2xl font-semibold mb-10'>
          {t('title')}
        </h2>
        {/* Desktop grid */}
        <div className='relative hidden md:grid grid-cols-4 gap-10'>
          {items.map((item) => (
            <div key={item.id} className='text-center px-2'>
              <div className='flex items-center justify-center h-32 mb-4'>
                {item.icon}
              </div>
              <h3 className='font-semibold mb-3 text-base'>{item.title}</h3>
              <p className='text-sm leading-relaxed text-muted-foreground'>
                {item.description}
              </p>
            </div>
          ))}
        </div>
        {/* Mobile carousel */}
        <div className='relative md:hidden -mx-4'>
          <Carousel
            className='px-4'
            opts={{ align: 'start', dragFree: false, loop: false }}
            setApi={setApi}
          >
            <CarouselContent className='-ml-0'>
              {items.map((item) => (
                <CarouselItem key={item.id} className='pl-0'>
                  <div className='text-center px-4'>
                    <div className='flex items-center justify-center h-32 mb-4'>
                      {item.icon}
                    </div>
                    <h3 className='font-semibold mb-3 text-base'>
                      {item.title}
                    </h3>
                    <p className='text-sm leading-relaxed text-muted-foreground'>
                      {item.description}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Indicators */}
            <div className='flex justify-center gap-2 mt-6'>
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type='button'
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    current === index
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50',
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  )
}

export default PromoFeaturesSection
