import React from 'react'
import { Skeleton } from '@/components/atoms/skeleton'

export interface SavedListingsLoadingStateProps {
  itemsCount?: number
}

/**
 * SavedListingsLoadingState
 * Loading skeleton for saved listings page
 * Follows Atomic Design: Organism component
 */
export const SavedListingsLoadingState: React.FC<
  SavedListingsLoadingStateProps
> = ({ itemsCount = 8 }) => {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <Skeleton className='h-10 w-64 mb-4' />
        <Skeleton className='h-6 w-96' />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {Array.from({ length: itemsCount }).map((_, i) => (
          <Skeleton key={i} className='h-80 w-full rounded-lg' />
        ))}
      </div>
    </div>
  )
}

export default SavedListingsLoadingState
