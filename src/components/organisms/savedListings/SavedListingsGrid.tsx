import React from 'react'
import PropertyCard from '@/components/molecules/propertyCard'
import { SavedListing } from '@/api/types'

export interface SavedListingsGridProps {
  savedListings: SavedListing[]
  onCardClick: (listingId: number) => void
}

/**
 * SavedListingsGrid
 * Responsive grid layout for saved listings cards
 * Follows Atomic Design: Organism component
 */
export const SavedListingsGrid: React.FC<SavedListingsGridProps> = ({
  savedListings,
  onCardClick,
}) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'>
      {savedListings.map((savedListing) => {
        const listing = savedListing.listing
        if (!listing) return null

        return (
          <PropertyCard
            key={savedListing.listingId}
            listing={listing}
            onClick={() => onCardClick(savedListing.listingId)}
            imageLayout='top'
          />
        )
      })}
    </div>
  )
}

export default SavedListingsGrid
