import { useState } from 'react'
import { ListingStatus } from '@/components/molecules/listings/ListingStatusFilter'
import { PLACEHOLDER_COUNTS } from '../index.constants'
import { createDialogHandlers } from '../index.helpers'
import { ListingPreview } from '../index.types'

export const useListingsManagement = () => {
  const [status, setStatus] = useState<ListingStatus>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [showProvinceSelection, setShowProvinceSelection] = useState(false)
  const [showDistrictSelection, setShowDistrictSelection] = useState(false)
  const [showWardSelection, setShowWardSelection] = useState(false)
  const [showListingTypeSelection, setShowListingTypeSelection] =
    useState(false)

  // Placeholder counts (would come from API later)
  const counts = PLACEHOLDER_COUNTS

  // In real implementation, fetch listings based on status; here always empty
  const listings: ListingPreview[] = []

  // Handler functions using helpers
  const dialogHandlers = createDialogHandlers(
    setFilterOpen,
    setShowProvinceSelection,
    setShowDistrictSelection,
    setShowWardSelection,
    setShowListingTypeSelection,
  )

  return {
    // State
    status,
    setStatus,
    filterOpen,
    setFilterOpen,
    showProvinceSelection,
    setShowProvinceSelection,
    showDistrictSelection,
    setShowDistrictSelection,
    showWardSelection,
    setShowWardSelection,
    showListingTypeSelection,
    setShowListingTypeSelection,

    // Derived data
    counts,
    listings,

    // Handlers
    dialogHandlers,
  }
}
