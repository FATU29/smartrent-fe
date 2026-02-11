import React from 'react'
import classNames from 'classnames'
import { Card, CardContent } from '@/components/atoms/card'
import { Skeleton } from '@/components/atoms/skeleton'

interface NewsGridItemSkeletonProps {
  className?: string
}

const NewsGridItemSkeleton: React.FC<NewsGridItemSkeletonProps> = ({
  className,
}) => (
  <Card
    className={classNames(
      'overflow-hidden h-full flex flex-col animate-pulse',
      className,
    )}
  >
    {/* Thumbnail placeholder */}
    <div className='relative aspect-video bg-muted'>
      <Skeleton className='w-full h-full rounded-none' />
      <div className='absolute top-3 left-3'>
        <Skeleton className='h-5 w-16 rounded-full' />
      </div>
    </div>

    {/* Body placeholder */}
    <CardContent className='flex flex-col flex-1 p-4 gap-2'>
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-3/4' />
      <Skeleton className='h-3 w-full mt-1' />
      <Skeleton className='h-3 w-2/3' />
      <div className='flex items-center gap-2 pt-3 border-t mt-auto'>
        <Skeleton className='h-3 w-16' />
        <Skeleton className='h-3 w-20' />
        <Skeleton className='h-3 w-12' />
      </div>
    </CardContent>
  </Card>
)

export default NewsGridItemSkeleton
