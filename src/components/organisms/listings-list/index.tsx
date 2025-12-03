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
  onViewReport?: (listing: ListingOwnerDetail) => void
  onRequestVerification?: (listing: ListingOwnerDetail) => void
  onCopyListing?: (listing: ListingOwnerDetail) => void
  onRequestContact?: (listing: ListingOwnerDetail) => void
  onShare?: (listing: ListingOwnerDetail) => void
  onActivityHistory?: (listing: ListingOwnerDetail) => void
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
  onViewReport,
  onRequestVerification,
  onCopyListing,
  onRequestContact,
  onShare,
  onActivityHistory,
  onTakeDown,
  onDelete,
  loading = false,
  skeletonCount = 3,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn(LISTINGS_LIST_STYLES.container, className)}>
        <ListingCardSkeleton count={skeletonCount} />
      </div>
    )
  }

  if (listings.length === 0) {
    return null
  }

  return (
    <div className={cn(LISTINGS_LIST_STYLES.container, className)}>
      {listings.map((listing) => (
        <ListingCard
          key={`${LISTINGS_LIST_CONFIG.itemKeyPrefix}${listing.listingId}`}
          property={listing}
          onEdit={() => onEditListing?.(listing)}
          onPromote={() => onPromoteListing?.(listing)}
          onRepost={() => onRepostListing?.(listing)}
          onViewReport={() => onViewReport?.(listing)}
          onRequestVerification={() => onRequestVerification?.(listing)}
          onCopyListing={() => onCopyListing?.(listing)}
          onRequestContact={() => onRequestContact?.(listing)}
          onShare={() => onShare?.(listing)}
          onActivityHistory={() => onActivityHistory?.(listing)}
          onTakeDown={() => onTakeDown?.(listing)}
          onDelete={() => onDelete?.(listing)}
        />
      ))}
    </div>
  )
}
