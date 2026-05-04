import React from 'react'
import { ListingCard } from '@/components/organisms/listing-card'
import { cn } from '@/lib/utils'
import { LISTINGS_LIST_STYLES, LISTINGS_LIST_CONFIG } from './index.constants'
import { ListingCardSkeleton } from '../listing-card/ListingCardSkeleton'
import { ListingOwnerDetail } from '@/api/types'

export interface ListingsListProps {
  listings: ListingOwnerDetail[]
  onEditListing?: (listing: ListingOwnerDetail) => void
  onPromoteListing?: (listing: ListingOwnerDetail) => void
  onRepostListing?: (listing: ListingOwnerDetail) => void
  onResubmitListing?: (listing: ListingOwnerDetail) => void
  onCopyListing?: (listing: ListingOwnerDetail) => void
  onTakeDown?: (listing: ListingOwnerDetail) => void
  onDelete?: (listing: ListingOwnerDetail) => void
  loading?: boolean
  skeletonCount?: number
  className?: string
}

export const ListingsList: React.FC<ListingsListProps> = ({
  listings,
  onEditListing,
  onPromoteListing,
  onRepostListing,
  onResubmitListing,
  onCopyListing,
  onTakeDown,
  onDelete,
  loading = false,
  skeletonCount = 3,
  className,
}) => {
  const uniqueListings = React.useMemo(() => {
    const seen = new Set<string>()
    return listings.filter((listing) => {
      const id = listing?.listingId
      if (id === undefined || id === null) return false
      const key = String(id)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [listings])

  if (loading) {
    return (
      <div className={cn(LISTINGS_LIST_STYLES.container, className)}>
        <ListingCardSkeleton count={skeletonCount} />
      </div>
    )
  }

  if (uniqueListings.length === 0) {
    return null
  }

  return (
    <div className={cn(LISTINGS_LIST_STYLES.container, className)}>
      {uniqueListings.map((listing) => (
        <ListingCard
          key={`${LISTINGS_LIST_CONFIG.itemKeyPrefix}${listing.listingId}`}
          property={listing}
          onEdit={() => onEditListing?.(listing)}
          onPromote={() => onPromoteListing?.(listing)}
          onRepost={() => onRepostListing?.(listing)}
          onResubmit={() => onResubmitListing?.(listing)}
          onCopyListing={() => onCopyListing?.(listing)}
          onTakeDown={() => onTakeDown?.(listing)}
          onDelete={() => onDelete?.(listing)}
        />
      ))}
    </div>
  )
}
