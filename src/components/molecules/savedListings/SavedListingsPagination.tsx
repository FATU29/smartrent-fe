import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'

export interface SavedListingsPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * SavedListingsPagination
 * Pagination controls for saved listings
 * Follows Atomic Design: Molecule component
 */
export const SavedListingsPagination: React.FC<
  SavedListingsPaginationProps
> = ({ currentPage, totalPages, onPageChange }) => {
  const tCommon = useTranslations('common')

  if (totalPages <= 1) return null

  return (
    <div className='flex items-center justify-center gap-2'>
      <Button
        variant='outline'
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        {tCommon('pagination.previous')}
      </Button>
      <div className='flex items-center gap-2'>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? 'default' : 'outline'}
            onClick={() => onPageChange(pageNum)}
            className='min-w-10'
          >
            {pageNum}
          </Button>
        ))}
      </div>
      <Button
        variant='outline'
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        {tCommon('pagination.next')}
      </Button>
    </div>
  )
}

export default SavedListingsPagination
