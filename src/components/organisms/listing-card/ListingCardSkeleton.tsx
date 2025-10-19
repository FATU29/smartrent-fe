import React from 'react'
import { cn } from '@/lib/utils'

export interface ListingCardSkeletonProps {
  className?: string
  count?: number
}

export const ListingCardSkeleton: React.FC<ListingCardSkeletonProps> = ({
  className,
  count = 1,
}) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={cn(
            'bg-background border border-border rounded-lg p-3 sm:p-4 animate-pulse',
            className,
          )}
        >
          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
            {/* Image Skeleton */}
            <div className='relative w-full h-48 sm:w-32 sm:h-24 flex-shrink-0'>
              <div className='w-full h-full bg-muted rounded-md' />
              {/* Package Badge Skeleton */}
              <div className='absolute top-2 left-2 w-16 h-6 bg-muted-foreground/20 rounded-lg' />
            </div>

            {/* Content Skeleton */}
            <div className='flex-1 min-w-0 space-y-3'>
              <div className='flex flex-col sm:flex-row sm:justify-between'>
                {/* Left Content Skeleton */}
                <div className='flex-1 sm:pr-4 space-y-2'>
                  {/* Title Skeleton */}
                  <div className='space-y-1'>
                    <div className='h-4 bg-muted rounded w-3/4' />
                    <div className='h-4 bg-muted rounded w-1/2' />
                  </div>

                  {/* Address Skeleton */}
                  <div className='h-3 bg-muted rounded w-2/3' />

                  {/* Property Info Skeleton */}
                  <div className='flex flex-col sm:flex-row gap-1 sm:gap-4'>
                    <div className='h-3 bg-muted rounded w-20' />
                    <div className='h-3 bg-muted rounded w-24' />
                    <div className='h-3 bg-muted rounded w-20' />
                  </div>

                  {/* Badges Skeleton */}
                  <div className='flex items-center gap-2'>
                    <div className='h-6 bg-muted rounded w-20' />
                    <div className='h-6 bg-muted rounded w-16' />
                  </div>
                </div>

                {/* Right Content Skeleton */}
                <div className='flex flex-col gap-3 mt-3 sm:mt-0'>
                  {/* Status Badge Skeleton */}
                  <div className='flex justify-start sm:justify-end'>
                    <div className='h-6 bg-muted rounded-full w-20' />
                  </div>

                  {/* Stats Skeleton */}
                  <div className='flex items-center gap-3'>
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className='flex flex-col items-center gap-1'>
                        <div className='w-8 h-8 bg-muted rounded-full' />
                        <div className='w-12 h-2 bg-muted rounded' />
                        <div className='w-6 h-3 bg-muted rounded' />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Skeleton */}
              <div className='flex items-center justify-between pt-2 border-t border-border'>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 bg-muted rounded' />
                  <div className='w-16 h-6 bg-muted rounded' />
                  <div className='w-16 h-6 bg-muted rounded' />
                </div>
                <div className='w-8 h-8 bg-muted rounded' />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
