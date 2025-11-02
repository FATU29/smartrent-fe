import React from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'
import { ListingFilterContent } from '@/components/molecules/listings/ListingFilterContent'
import { List } from '@/contexts/list'

export interface ListingFilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: () => void
  showProvinceSelection: boolean
  onProvinceSelectionChange: (show: boolean) => void
  showDistrictSelection: boolean
  onDistrictSelectionChange: (show: boolean) => void
  showWardSelection: boolean
  onWardSelectionChange: (show: boolean) => void
  showListingTypeSelection: boolean
  onListingTypeSelectionChange: (show: boolean) => void
  onBackToMain: () => void
}

export const ListingFilterDialog: React.FC<ListingFilterDialogProps> = ({
  open,
  onOpenChange,
  onApply,
  showProvinceSelection,
  onProvinceSelectionChange,
  showDistrictSelection,
  onDistrictSelectionChange,
  showWardSelection,
  onWardSelectionChange,
  showListingTypeSelection,
  onListingTypeSelectionChange,
  onBackToMain,
}) => {
  const t = useTranslations()
  const listingsFetcher = () => {
    console.log('Fetching listings with applied filters')
    return Promise.resolve({
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='size-full md:size-[600px] rounded-none md:rounded-2xl shadow-lg'>
        <DialogHeader>
          <DialogTitle>
            {t('seller.listingManagement.filter.title')}
          </DialogTitle>
        </DialogHeader>
        <div className='size-full overflow-y-auto px-4 sm:px-6 -mx-4'>
          <List.Provider fetcher={listingsFetcher}>
            <ListingFilterContent
              onApply={onApply}
              showProvinceSelection={showProvinceSelection}
              onProvinceSelectionChange={onProvinceSelectionChange}
              showDistrictSelection={showDistrictSelection}
              onDistrictSelectionChange={onDistrictSelectionChange}
              showWardSelection={showWardSelection}
              onWardSelectionChange={onWardSelectionChange}
              showListingTypeSelection={showListingTypeSelection}
              onListingTypeSelectionChange={onListingTypeSelectionChange}
              onCustomRangeChange={() => {}}
              onBackToMain={onBackToMain}
            />
          </List.Provider>
        </div>
      </DialogContent>
    </Dialog>
  )
}
