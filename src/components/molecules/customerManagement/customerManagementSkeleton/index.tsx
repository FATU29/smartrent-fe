import React from 'react'
import { Skeleton } from '@/components/atoms/skeleton'
import CustomerCardSkeleton from '../customerCardSkeleton'

const CustomerManagementSkeleton: React.FC = () => {
  return (
    <div className='h-full flex flex-col bg-background'>
      <div className='flex-1 flex overflow-hidden w-full'>
        {/* Left Panel */}
        <div className='w-full lg:w-1/2 border-r bg-white flex flex-col'>
          {/* Search with Stats */}
          <div className='p-4 border-b'>
            <div className='flex flex-col mb:flex-row items-center gap-4'>
              <div className='flex-1 w-full'>
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='flex gap-2'>
                <Skeleton className='h-10 w-24' />
                <Skeleton className='h-10 w-24' />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className='flex-1 flex flex-col'>
            {/* Tab Header */}
            <div className='border-b px-4'>
              <div className='flex gap-4'>
                <Skeleton className='h-10 w-32' />
                <Skeleton className='h-10 w-32' />
              </div>
            </div>

            {/* Tab Content */}
            <div className='flex-1 overflow-y-auto p-4 space-y-3'>
              <CustomerCardSkeleton />
              <CustomerCardSkeleton />
              <CustomerCardSkeleton />
              <CustomerCardSkeleton />
              <CustomerCardSkeleton />
            </div>
          </div>
        </div>

        {/* Right Panel - Detail View (Desktop only) */}
        <div className='hidden lg:flex lg:w-1/2 bg-muted/30'>
          <div className='w-full p-6 space-y-4'>
            <Skeleton className='h-8 w-48' />
            <div className='space-y-3'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-4 w-1/2' />
            </div>
            <div className='space-y-2 mt-6'>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-20 w-full' />
              <Skeleton className='h-20 w-full' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerManagementSkeleton
