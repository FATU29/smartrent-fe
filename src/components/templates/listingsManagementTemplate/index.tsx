import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  ListingStatus,
  ListingStatusFilterResponsive,
} from '@/components/molecules/listings/ListingStatusFilterResponsive'
import { ListingEmptyState } from '@/components/organisms/listings/ListingEmptyState'
import { ListingToolbar } from '@/components/molecules/listings/ListingToolbar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'
import { ListingFilterContent } from '@/components/molecules/listings/ListingFilterContent'
import { List, ListFilters } from '@/contexts/list'

const PLACEHOLDER_COUNTS = {
  all: 24,
  expired: 3,
  expiring: 5,
  active: 12,
  pending: 2,
  review: 1,
  payment: 0,
  rejected: 1,
  archived: 0,
}

export const ListingsManagementTemplate: React.FC = () => {
  const t = useTranslations()
  const [status, setStatus] = useState<ListingStatus>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [showProvinceSelection, setShowProvinceSelection] = useState(false)
  const [showDistrictSelection, setShowDistrictSelection] = useState(false)
  const [showWardSelection, setShowWardSelection] = useState(false)
  const [showListingTypeSelection, setShowListingTypeSelection] =
    useState(false)

  const counts = PLACEHOLDER_COUNTS

  const listingsFetcher = async (filters: ListFilters) => {
    console.log('Fetching with filters:', filters)
    return {
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    }
  }

  interface ListingPreview {
    id: string
  }
  const listings: ListingPreview[] = []

  // Handler functions
  const handleFilterOpen = () => setFilterOpen(true)
  const handleFilterApply = () => setFilterOpen(false)

  const handleResetAllSelections = () => {
    setShowProvinceSelection(false)
    setShowDistrictSelection(false)
    setShowWardSelection(false)
    setShowListingTypeSelection(false)
  }

  const handleBackToMain = () => {
    handleResetAllSelections()
  }

  return (
    <div className='p-4'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6'>
        <ListingToolbar
          total={listings.length}
          onSearch={() => {}}
          onFilterClick={handleFilterOpen}
          onExport={() => {}}
        />
        <ListingStatusFilterResponsive
          value={status}
          counts={counts}
          onChange={setStatus}
        />
        <div className='min-h-[300px]'>
          {listings.length === 0 && <ListingEmptyState />}
        </div>
      </div>
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className='rounded-none md:h-[650px] md:w-[550px] md:rounded-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              {t('seller.listingManagement.filter.title')}
            </DialogTitle>
          </DialogHeader>
          <List.Provider fetcher={listingsFetcher}>
            <ListingFilterContent
              onApply={handleFilterApply}
              showProvinceSelection={showProvinceSelection}
              onProvinceSelectionChange={setShowProvinceSelection}
              showDistrictSelection={showDistrictSelection}
              onDistrictSelectionChange={setShowDistrictSelection}
              showWardSelection={showWardSelection}
              onWardSelectionChange={setShowWardSelection}
              showListingTypeSelection={showListingTypeSelection}
              onListingTypeSelectionChange={setShowListingTypeSelection}
              onCustomRangeChange={() => {}}
              onBackToMain={handleBackToMain}
            />
          </List.Provider>
        </DialogContent>
      </Dialog>
    </div>
  )
}
