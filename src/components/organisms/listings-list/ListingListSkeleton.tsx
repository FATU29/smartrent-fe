import React from 'react'
import { Skeleton } from '@/components/atoms/skeleton'
import { cn } from '@/lib/utils'
import { LISTINGS_LIST_STYLES } from './index.constants'

interface ListingListSkeletonProps {
  count?: number
  className?: string
}

const ListingCardSkeletonItem: React.FC = () => {
  return (
    <div className='w-full rounded-lg border border-gray-200 overflow-hidden bg-white'>
      {/* Image skeleton */}
      <div className='relative'>
        <Skeleton className='h-48 w-full rounded-none' />
        <div className='absolute top-2 right-2'>
          <Skeleton className='h-8 w-8 rounded-full' />
        </div>
        <div className='absolute top-2 left-2'>
          <Skeleton className='h-6 w-20 rounded' />
        </div>
      </div>

      {/* Content skeleton */}
      <div className='p-4 space-y-3'>
        {/* Title */}
        <Skeleton className='h-6 w-3/4' />

        {/* Location */}
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-4 rounded' />
          <Skeleton className='h-4 w-1/2' />
        </div>

        {/* Price and area */}
        <div className='flex items-center justify-between'>
          <Skeleton className='h-5 w-24' />
          <Skeleton className='h-4 w-20' />
        </div>

        {/* Status badges */}
        <div className='flex items-center gap-2'>
          <Skeleton className='h-6 w-16 rounded-full' />
          <Skeleton className='h-6 w-20 rounded-full' />
        </div>

        {/* Stats */}
        <div className='flex items-center gap-4 pt-2 border-t'>
          <div className='flex items-center gap-1'>
            <Skeleton className='h-4 w-4 rounded' />
            <Skeleton className='h-4 w-8' />
          </div>
          <div className='flex items-center gap-1'>
            <Skeleton className='h-4 w-4 rounded' />
            <Skeleton className='h-4 w-8' />
          </div>
          <div className='flex items-center gap-1'>
            <Skeleton className='h-4 w-4 rounded' />
            <Skeleton className='h-4 w-8' />
          </div>
        </div>

        {/* Action buttons */}
        <div className='flex items-center gap-2 pt-2'>
          <Skeleton className='h-9 flex-1' />
          <Skeleton className='h-9 w-9' />
        </div>
      </div>
    </div>
  )
}

export const ListingListSkeleton: React.FC<ListingListSkeletonProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={cn(LISTINGS_LIST_STYLES.container, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <ListingCardSkeletonItem key={`listing-skeleton-${index}`} />
      ))}
    </div>
  )
}
