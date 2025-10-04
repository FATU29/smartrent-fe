import React from 'react'
import { ListingStatusFilterResponsive } from '@/components/molecules/listings/ListingStatusFilterResponsive'
import { ListingEmptyState } from '@/components/organisms/listings/ListingEmptyState'
import { ListingToolbar } from '@/components/molecules/listings/ListingToolbar'
import { ListingContainer } from '@/components/atoms/listingContainer'
import { ListingContentArea } from '@/components/atoms/listingContentArea'
import { ListingFilterDialog } from '@/components/molecules/listingFilterDialog'
import { useListingsManagement } from './hooks/useListingsManagement'

export const ListingsManagementTemplate: React.FC = () => {
  const {
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
    counts,
    listings,
    dialogHandlers,
  } = useListingsManagement()

  return (
    <ListingContainer>
      <ListingToolbar
        total={listings.length}
        onSearch={() => {}}
        onFilterClick={dialogHandlers.handleFilterOpen}
        onExport={() => {}}
      />
      <ListingStatusFilterResponsive
        value={status}
        counts={counts}
        onChange={setStatus}
      />
      <ListingContentArea>
        {listings.length === 0 && <ListingEmptyState />}
      </ListingContentArea>

      <ListingFilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        onApply={dialogHandlers.handleFilterApply}
        showProvinceSelection={showProvinceSelection}
        onProvinceSelectionChange={setShowProvinceSelection}
        showDistrictSelection={showDistrictSelection}
        onDistrictSelectionChange={setShowDistrictSelection}
        showWardSelection={showWardSelection}
        onWardSelectionChange={setShowWardSelection}
        showListingTypeSelection={showListingTypeSelection}
        onListingTypeSelectionChange={setShowListingTypeSelection}
        onBackToMain={dialogHandlers.handleBackToMain}
      />
    </ListingContainer>
  )
}
