'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { SavedListing } from '@/api/types'
import { SavedListingService } from '@/api/services'
import { PUBLIC_ROUTES } from '@/constants/route'
import { isListingPubliclyVisible } from '@/utils/property'
import {
  SavedListingsEmptyState,
  SavedListingsHeader,
  SavedListingsGrid,
  SavedListingsLoadingState,
} from '@/components/organisms/savedListings'
import { List, useListContext } from '@/contexts/list'
import { PageContainer } from '@/components/atoms/pageContainer'

/**
 * SavedListingsTemplate
 * Uses List Context for pagination and state management
 * Clean and declarative component composition
 */
const SavedListingsContent: React.FC = () => {
  const router = useRouter()
  const { items, isLoading, pagination, removeItem } =
    useListContext<SavedListing>()

  // Listings that expired/were unpublished after being saved still come back
  // from the API with full data (the endpoint has no visibility filter), so
  // silently unsave them once detected — they're filtered from the grid
  // below regardless, this just stops them from reappearing on next visit.
  const cleanedUpIdsRef = useRef<Set<number>>(new Set())
  useEffect(() => {
    const staleItems = items.filter(
      (item) =>
        item.listing &&
        !isListingPubliclyVisible(item.listing) &&
        !cleanedUpIdsRef.current.has(item.listingId),
    )

    staleItems.forEach((item) => {
      cleanedUpIdsRef.current.add(item.listingId)
      SavedListingService.unsave(item.listingId)
        .then(() => removeItem(item.listingId))
        .catch(() => {
          cleanedUpIdsRef.current.delete(item.listingId)
        })
    })
  }, [items, removeItem])
  // List context starts with isLoading=false and only flips to true inside a
  // useEffect, so first paint would briefly render the empty state. Track when
  // the first fetch attempt has actually completed and gate the empty state on
  // that — until then, render the skeleton.
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false)
  useEffect(() => {
    if (isLoading) {
      setHasFetchedOnce(true)
    }
  }, [isLoading])

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

  // Loading state — covers both in-flight fetches and the pre-fetch first paint
  if ((isLoading || !hasFetchedOnce) && items.length === 0) {
    return <SavedListingsLoadingState />
  }

  // Empty state - only after we've actually attempted a fetch
  if (
    items.length === 0 &&
    !isLoading &&
    hasFetchedOnce &&
    pagination.totalCount === 0
  ) {
    return <SavedListingsEmptyState onBrowseListings={handleBrowseListings} />
  }

  // Main content - Only show when there are items
  return (
    <PageContainer width='grid' className='py-8'>
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
    </PageContainer>
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
