'use client'

import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { SavedListing } from '@/api/types'
import { PUBLIC_ROUTES } from '@/constants/route'
import {
  SavedListingsEmptyState,
  SavedListingsHeader,
  SavedListingsGrid,
  SavedListingsLoadingState,
} from '@/components/organisms/savedListings'
import { List, useListContext } from '@/contexts/list'

/**
 * SavedListingsTemplate
 * Uses List Context for pagination and state management
 * Clean and declarative component composition
 */
const SavedListingsContent: React.FC = () => {
  const router = useRouter()
  const { items, isLoading, pagination } = useListContext<SavedListing>()

  // Event handlers
  const handleCardClick = useCallback(
    (listingId: number) => {
      router.push(
        `${PUBLIC_ROUTES.APARTMENT_DETAIL_PREFIX}/${listingId.toString()}`,
      )
    },
    [router],
  )

  const handleBrowseListings = useCallback(() => {
    router.push(PUBLIC_ROUTES.PROPERTIES_PREFIX)
  }, [router])

  // Loading state
  if (isLoading && items.length === 0) {
    return <SavedListingsLoadingState />
  }

  // Empty state - Show when no items AND no loading
  if (items.length === 0 && !isLoading && pagination.totalCount === 0) {
    return <SavedListingsEmptyState onBrowseListings={handleBrowseListings} />
  }

  // Main content - Only show when there are items
  return (
    <div className='container mx-auto px-4 py-8'>
      <SavedListingsHeader
        totalElements={pagination.totalCount}
        onBack={() => router.back()}
      />

      <SavedListingsGrid savedListings={items} onCardClick={handleCardClick} />

      {/* Only show pagination if there are items */}
      {items.length > 0 && (
        <List.Pagination
          className='mt-8'
          showPerPageSelector={false}
          showPageInfo={true}
          showPageNumbers={true}
        />
      )}
    </div>
  )
}

/**
 * Main template component
 * Wraps content with List Context
 */
const SavedListingsTemplate: React.FC = () => {
  return <SavedListingsContent />
}

export default SavedListingsTemplate
