import React from 'react'
import classNames from 'classnames'
import { Card, CardContent } from '@/components/atoms/card'
import { Skeleton } from '@/components/atoms/skeleton'

interface NewsCardSkeletonProps {
  count?: number
  layout?: 'horizontal' | 'vertical'
  className?: string
}

const NewsCardSkeletonSingle: React.FC<{
  layout: 'horizontal' | 'vertical'
  className?: string
}> = ({ layout, className }) => {
  const isHorizontal = layout === 'horizontal'

  return (
    <Card
      className={classNames(
        'overflow-hidden h-full',
        {
          'flex flex-row': isHorizontal,
          'flex flex-col': !isHorizontal,
        },
        className,
      )}
    >
      {/* Image Skeleton */}
      <div
        className={classNames('relative overflow-hidden bg-muted', {
          'w-1/3 min-w-[140px] max-w-[200px] flex-shrink-0 h-[120px]':
            isHorizontal,
          'aspect-video w-full': !isHorizontal,
        })}
      >
        <Skeleton className='absolute inset-0' />
        {/* Category Badge Skeleton */}
        <div className='absolute top-3 left-3'>
          <Skeleton className='h-5 w-16 rounded-md' />
        </div>
      </div>

      {/* Content Skeleton */}
      <CardContent
        className={classNames('flex flex-col flex-1 p-4', {
          'py-3': isHorizontal,
        })}
      >
        {/* Title Skeleton */}
        <Skeleton
          className={classNames('h-5', {
            'w-full': isHorizontal,
            'w-3/4 mb-2': !isHorizontal,
          })}
        />
        {!isHorizontal && <Skeleton className='h-5 w-1/2 mt-1' />}

        {/* Summary Skeleton */}
        <div
          className={classNames('flex-1', {
            'mt-2': isHorizontal,
            'mt-3': !isHorizontal,
          })}
        >
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4 mt-1' />
        </div>

        {/* Tags Skeleton */}
        {!isHorizontal && (
          <div className='flex gap-2 mt-3'>
            <Skeleton className='h-5 w-14 rounded-full' />
            <Skeleton className='h-5 w-16 rounded-full' />
            <Skeleton className='h-5 w-12 rounded-full' />
          </div>
        )}

        {/* Meta Skeleton */}
        <div
          className={classNames('flex items-center gap-3', {
            'mt-2': isHorizontal,
            'mt-4 pt-3 border-t': !isHorizontal,
          })}
        >
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-4 w-12' />
        </div>
      </CardContent>
    </Card>
  )
}

export const NewsCardSkeleton: React.FC<NewsCardSkeletonProps> = ({
  count = 1,
  layout = 'vertical',
  className,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <NewsCardSkeletonSingle
          key={index}
          layout={layout}
          className={className}
        />
      ))}
    </>
  )
}

export default NewsCardSkeleton
