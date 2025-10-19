import React from 'react'
import { Property } from '@/api/types/property.type'
import { ListingCard } from '@/components/organisms/listing-card'
import { cn } from '@/lib/utils'
import { LISTINGS_LIST_STYLES, LISTINGS_LIST_CONFIG } from './index.constants'
import { ListingCardSkeleton } from '../listing-card/ListingCardSkeleton'

export interface ListingsListProps {
  listings: Property[]
  onEditListing?: (listing: Property) => void
  onPromoteListing?: (listing: Property) => void
  onRepostListing?: (listing: Property) => void
  onViewReport?: (listing: Property) => void
  onRequestVerification?: (listing: Property) => void
  onCopyListing?: (listing: Property) => void
  onRequestContact?: (listing: Property) => void
  onShare?: (listing: Property) => void
  onActivityHistory?: (listing: Property) => void
  onTakeDown?: (listing: Property) => void
  onDelete?: (listing: Property) => void
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
    return null // Empty state is handled by parent component
  }

  return (
    <div className={cn(LISTINGS_LIST_STYLES.container, className)}>
      {listings.map((listing) => (
        <ListingCard
          key={`${LISTINGS_LIST_CONFIG.itemKeyPrefix}${listing.id}`}
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
