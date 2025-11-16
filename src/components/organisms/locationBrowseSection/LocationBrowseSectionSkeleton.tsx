import React from 'react'
import { Skeleton } from '@/components/atoms/skeleton'

const LocationBrowseSectionSkeleton: React.FC = () => {
  return (
    <section className='mt-16'>
      <Skeleton className='h-8 w-64 mb-6' />
      <div className='hidden md:flex md:gap-6'>
        {/* Left large card skeleton */}
        <div className='flex-2'>
          <Skeleton className='h-72 md:h-80 w-full rounded-md' />
        </div>
        {/* Right side grid skeleton */}
        <div className='flex-[1.2] grid w-full gap-6 grid-cols-2 auto-rows-[160px]'>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className='h-40 w-full rounded-md' />
          ))}
        </div>
      </div>
      {/* Mobile layout skeleton */}
      <div className='md:hidden space-y-6'>
        <Skeleton className='h-72 w-full rounded-md' />
        <div className='flex gap-4 overflow-x-auto pb-2'>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              key={index}
              className='h-40 w-64 flex-shrink-0 rounded-md'
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default LocationBrowseSectionSkeleton
