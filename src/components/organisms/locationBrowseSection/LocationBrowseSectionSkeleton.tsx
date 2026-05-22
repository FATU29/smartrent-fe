import React from 'react'
import { Skeleton } from '@/components/atoms/skeleton'

const LocationBrowseSectionSkeleton: React.FC = () => {
  return (
    <section className='mb-8 sm:mb-10'>
      {/* Header: mirrors the bar + section title of the real section */}
      <div className='flex items-center gap-3 mb-5 sm:mb-6'>
        <div className='w-1 h-7 sm:h-8 rounded-full bg-primary/30' />
        <Skeleton className='h-8 w-64' />
      </div>

      {/* Card row: mirrors the carousel (1 / 2 / 3 cards per view) */}
      <div className='flex overflow-hidden -ml-4'>
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className='min-w-0 shrink-0 grow-0 pl-4 basis-full sm:basis-1/2 lg:basis-1/3'
          >
            <Skeleton className='h-[280px] w-full rounded-xl' />
          </div>
        ))}
      </div>
    </section>
  )
}

export default LocationBrowseSectionSkeleton
