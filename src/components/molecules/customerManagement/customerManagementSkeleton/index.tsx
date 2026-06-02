import React from 'react'
import { Skeleton } from '@/components/atoms/skeleton'
import { Card } from '@/components/atoms/card'
import { PageContainer } from '@/components/atoms/pageContainer'

const STAT_KEYS = ['totalCustomers', 'totalClicks', 'uniqueUsers']
const ROW_KEYS = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6']

/** Skeleton for just the customer rows — reused while a search/page refetches. */
export const CustomerRowsSkeleton: React.FC = () => {
  return (
    <Card className='overflow-hidden p-0'>
      <div className='divide-y divide-border'>
        {ROW_KEYS.map((key) => (
          <div key={key} className='flex items-center gap-4 px-6 py-4'>
            <Skeleton className='h-10 w-10 rounded-full flex-shrink-0' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-40 max-w-full' />
              <Skeleton className='h-3 w-56 max-w-full' />
            </div>
            <Skeleton className='hidden md:block h-4 w-28' />
            <Skeleton className='h-6 w-12 rounded-full flex-shrink-0' />
          </div>
        ))}
      </div>
    </Card>
  )
}

const CustomerManagementSkeleton: React.FC = () => {
  return (
    <PageContainer width='grid' className='pt-8 pb-20 space-y-6'>
      {/* Header */}
      <div className='space-y-2'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-80 max-w-full' />
      </div>

      {/* Stats cards */}
      <div className='grid gap-4 grid-cols-1 md:grid-cols-3'>
        {STAT_KEYS.map((key) => (
          <Card key={key} className='p-5'>
            <div className='flex items-center gap-3 mb-3'>
              <Skeleton className='h-9 w-9 rounded-lg' />
              <Skeleton className='h-4 w-24' />
            </div>
            <Skeleton className='h-8 w-16' />
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className='flex items-center gap-2 max-w-md'>
        <Skeleton className='h-10 flex-1 rounded-lg' />
        <Skeleton className='h-10 w-24 rounded-lg' />
      </div>

      {/* List header */}
      <div className='flex items-center justify-between'>
        <Skeleton className='h-5 w-32' />
        <Skeleton className='h-4 w-24' />
      </div>

      {/* Customer rows */}
      <CustomerRowsSkeleton />
    </PageContainer>
  )
}

export default CustomerManagementSkeleton
