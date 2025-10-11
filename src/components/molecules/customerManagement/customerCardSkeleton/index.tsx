import React from 'react'
import { Skeleton } from '@/components/atoms/skeleton'

const CustomerCardSkeleton: React.FC = () => {
  return (
    <div className='w-full p-4 rounded-lg border border-gray-200'>
      <div className='flex items-start gap-3'>
        <Skeleton className='h-12 w-12 rounded-full' />
        <div className='flex-1 space-y-2'>
          <div className='flex justify-between items-start gap-2'>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-4 w-16' />
          </div>
          <Skeleton className='h-4 w-40' />
          <Skeleton className='h-3 w-48' />
          <Skeleton className='h-4 w-full' />
        </div>
      </div>
    </div>
  )
}

export default CustomerCardSkeleton
