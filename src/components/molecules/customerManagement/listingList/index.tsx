import React from 'react'
import { ListingWithCustomers } from '@/api/types/customer.type'
import ListingCard from '../listingCard'
import CustomerCardSkeleton from '../customerCardSkeleton'
import EmptyState from '../emptyState'

interface ListingListProps {
  listings: ListingWithCustomers[]
  selectedListingId: string | null
  isLoading: boolean
  language: string
  onListingSelect: (listing: ListingWithCustomers) => void
}

const ListingList: React.FC<ListingListProps> = ({
  listings,
  selectedListingId,
  isLoading,
  language,
  onListingSelect,
}) => {
  if (isLoading) {
    return (
      <>
        <CustomerCardSkeleton />
        <CustomerCardSkeleton />
        <CustomerCardSkeleton />
      </>
    )
  }

  if (listings.length === 0) {
    return <EmptyState type='listings' />
  }

  return (
    <>
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          isSelected={selectedListingId === listing.id}
          onClick={() => onListingSelect(listing)}
          language={language}
        />
      ))}
    </>
  )
}

export default ListingList
