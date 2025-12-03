import { useTranslations } from 'next-intl'
import Carousel from '@/components/atoms/carousel'
import Image from 'next/image'
import { Button } from '@/components/atoms/button'
import { PUBLIC_ROUTES } from '@/constants/route'
import { useRouter } from 'next/router'

interface TopInterestItem {
  id: string
  title: string
  image: string
  listings?: number
}

const mockItems: TopInterestItem[] = [
  {
    id: 'vinhomes-cp',
    title: 'Vinhomes Central Park',
    image: '/images/example.png',
    listings: 1280,
  },
  {
    id: 'grand-park',
    title: 'Vinhomes Grand Park',
    image: '/images/rental-auth-bg.jpg',
    listings: 980,
  },
  {
    id: 'smart-city',
    title: 'Vinhomes Smart City',
    image: '/images/default-image.jpg',
    listings: 742,
  },
  {
    id: 'ocean-park',
    title: 'Vinhomes Ocean Park',
    image: '/images/example.png',
    listings: 650,
  },
  {
    id: 'granduer-palace',
    title: 'Grandeur Palace',
    image: '/images/default-image.jpg',
    listings: 312,
  },
]

const TopInterestSection = () => {
  const t = useTranslations('homePage.topInterest')
  const router = useRouter()
  return (
    <section className='mb-8 sm:mb-10'>
      <div className='flex items-center justify-between mb-4 sm:mb-5'>
        <h2 className='text-xl sm:text-2xl font-semibold'>{t('title')}</h2>
        <Button
          variant='ghost'
          size='sm'
          className='text-sm'
          onClick={() => router.push(PUBLIC_ROUTES.LISTING_LISTING)}
        >
          {t('viewAll')}
        </Button>
      </div>
      <Carousel.Root className='group' options={{ align: 'start' }} loop>
        {mockItems.map((item) => (
          <Carousel.Item
            key={item.id}
            className='flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-2'
          >
            <button
              type='button'
              className='w-full text-left relative rounded-lg overflow-hidden group/card border bg-background shadow-sm hover:shadow-md transition-all'
              onClick={() => router.push(PUBLIC_ROUTES.LISTING_LISTING)}
            >
              <div className='relative h-40 sm:h-44 lg:h-48 w-full'>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className='object-cover'
                  sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />
                <div className='absolute bottom-2 left-2 right-2'>
                  <p className='text-white font-medium text-sm sm:text-base drop-shadow'>
                    {item.title}
                  </p>
                  {item.listings && (
                    <span className='text-white/80 text-[11px] sm:text-xs'>
                      {item.listings.toLocaleString()} listings
                    </span>
                  )}
                </div>
              </div>
            </button>
          </Carousel.Item>
        ))}
        <Carousel.Indicators className='mt-4' />
      </Carousel.Root>
    </section>
  )
}

export default TopInterestSection
