import React from 'react'
import { Card, CardContent } from '@/components/atoms/card'
import { Skeleton } from '@/components/atoms/skeleton'
import { cn } from '@/lib/utils'

interface DraftCardSkeletonProps {
  className?: string
  count?: number
}

export const DraftCardSkeleton: React.FC<DraftCardSkeletonProps> = ({
  className,
  count = 1,
}) => {
  return (
    <div className='space-y-4'>
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className={cn('overflow-hidden', className)}>
          <CardContent className='p-0'>
            <div className='flex flex-col sm:flex-row animate-pulse'>
              {/* Image Skeleton - Larger and matches new design */}
              <Skeleton className='w-full sm:w-56 h-56 sm:h-auto rounded-none shrink-0' />

              {/* Content Skeleton */}
              <div className='flex-1 min-w-0 flex flex-col p-5 sm:p-6'>
                {/* Title & Description Skeleton */}
                <div className='space-y-2 mb-4'>
                  <Skeleton className='h-6 w-4/5' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                </div>

                {/* Address Skeleton - Highlighted box matching new design */}
                <div className='mb-4'>
                  <Skeleton className='h-16 w-full rounded-lg' />
                </div>

                {/* Property Specs Grid Skeleton */}
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5'>
                  <Skeleton className='h-[68px] rounded-lg' />
                  <Skeleton className='h-[68px] rounded-lg' />
                  <Skeleton className='h-[68px] rounded-lg' />
                  <Skeleton className='h-[68px] rounded-lg' />
                </div>

                {/* Footer with Date and Actions Skeleton */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto pt-4 border-t'>
                  <Skeleton className='h-7 w-36' />
                  <div className='flex gap-2'>
                    <Skeleton className='h-9 w-24' />
                    <Skeleton className='h-9 w-9' />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
