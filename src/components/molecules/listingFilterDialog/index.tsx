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
import { createMockListingsFetcher } from '@/components/templates/listingsManagement/index.helpers'

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
  const listingsFetcher = createMockListingsFetcher()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='!fixed !w-full !h-full sm:!w-auto sm:!h-auto sm:!max-w-xl sm:!max-h-[650px] !p-0 !rounded-none sm:!rounded-3xl !m-0 sm:!m-auto !inset-0 sm:!inset-auto !translate-x-0 !translate-y-0 sm:!translate-x-[-50%] sm:!translate-y-[-50%] !left-0 !top-0 sm:!left-[50%] sm:!top-[50%] !border-0 sm:!border !shadow-none sm:!shadow-lg !flex !flex-col'>
        <DialogHeader className='w-full flex-shrink-0 p-4 sm:p-6 pb-2 border-b border-border'>
          <DialogTitle className='flex items-center gap-2 text-lg sm:text-base font-semibold'>
            {t('seller.listingManagement.filter.title')}
          </DialogTitle>
        </DialogHeader>
        <div className='flex-1 w-full overflow-y-auto p-4 sm:p-6 pt-4 pb-24'>
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
