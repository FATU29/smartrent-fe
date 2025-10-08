import React from 'react'
import MobileCarousel from './MobileCarousel'
import { useTranslations } from 'next-intl'
import LocationCard from '@/components/molecules/locationCard'
import HorizontalScrollChips from '@/components/molecules/horizontalScrollChips'
import { CityItem } from './types'

interface LocationBrowseSectionProps {
  cities: CityItem[]
  onSelectCity?: (city: CityItem) => void
  onSelectProject?: (project: string) => void
}

const LocationBrowseSection: React.FC<LocationBrowseSectionProps> = ({
  cities,
  onSelectCity,
  onSelectProject,
}) => {
  const t = useTranslations('homePage.locations')
  const listingSuffix = t('listingsSuffix')

  if (!cities.length) return null

  const [first, ...rest] = cities

  return (
    <section className='mt-16'>
      <h2 className='text-xl sm:text-2xl font-semibold mb-6'>{t('title')}</h2>
      <div className='hidden md:flex md:gap-6'>
        {/* Left large card */}
        <div className='flex-2'>
          <LocationCard
            key={first.id}
            name={first.name}
            image={first.image}
            listingCount={first.listings}
            listingSuffix={listingSuffix}
            large
            onClick={() => onSelectCity?.(first)}
            className='!h-full'
          />
        </div>
        {/* Right side grid */}
        <div className='flex-[1.2] grid w-full gap-6 grid-cols-2 auto-rows-[160px]'>
          {rest.slice(0, 4).map((c) => (
            <LocationCard
              key={c.id}
              name={c.name}
              image={c.image}
              listingCount={c.listings}
              listingSuffix={listingSuffix}
              onClick={() => onSelectCity?.(c)}
              className='h-40'
            />
          ))}
        </div>
      </div>
      {/* Mobile layout: first big card + carousel for rest */}
      <div className='md:hidden space-y-6'>
        <LocationCard
          key={first.id}
          name={first.name}
          image={first.image}
          listingCount={first.listings}
          listingSuffix={listingSuffix}
          large
          onClick={() => onSelectCity?.(first)}
        />
        {!!rest.length && (
          <MobileCarousel
            cities={rest}
            listingSuffix={listingSuffix}
            onSelectCity={onSelectCity}
          />
        )}
      </div>
      {first.projects?.length ? (
        <div className='mt-6'>
          <HorizontalScrollChips
            items={first.projects}
            onSelect={(p) => onSelectProject?.(p)}
          />
        </div>
      ) : null}
    </section>
  )
}

export default LocationBrowseSection
