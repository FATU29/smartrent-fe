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
    <>
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className={cn('animate-pulse', className)}>
          <CardContent className='p-4'>
            <div className='flex gap-4'>
              {/* Image Skeleton */}
              <Skeleton className='w-24 h-24 sm:w-32 sm:h-32 rounded-lg shrink-0' />

              {/* Content Skeleton */}
              <div className='flex-1 min-w-0 flex flex-col gap-2'>
                {/* Title Skeleton */}
                <Skeleton className='h-5 w-3/4' />

                {/* Address Skeleton */}
                <Skeleton className='h-4 w-2/3' />

                {/* Property Info Skeleton */}
                <div className='flex flex-wrap gap-2'>
                  <Skeleton className='h-5 w-20' />
                  <Skeleton className='h-5 w-24' />
                  <Skeleton className='h-5 w-16' />
                </div>

                {/* Date Skeleton */}
                <Skeleton className='h-3 w-32 mt-auto' />

                {/* Actions Skeleton */}
                <div className='flex gap-2 mt-2'>
                  <Skeleton className='h-8 w-20' />
                  <Skeleton className='h-8 w-8' />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
