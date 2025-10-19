import React from 'react'
import { useTranslations } from 'next-intl'
import { FilterSection } from '@/components/atoms/filter-section'
import { AddChipButton } from '@/components/atoms/add-chip-button'
import { ChipsList } from '@/components/molecules/chipsList'
import { ListingFilterValues } from '../ListingFilterContent'
import { generateChipData } from '../utils/chipUtils'
import { createChipRemoveHandler } from '../utils/chipRemoveHandlers'

interface ListingTypeFilterSectionProps {
  values: ListingFilterValues
  onChange: (v: ListingFilterValues) => void
  onListingTypeSelectionChange?: (show: boolean) => void
}

export const ListingTypeFilterSection: React.FC<
  ListingTypeFilterSectionProps
> = ({ values, onChange, onListingTypeSelectionChange }) => {
  const t = useTranslations('seller.listingManagement.filter')

  const listingTypeChips = generateChipData.listingTypes(
    values.listingTypeCodes,
  )

  const chipRemoveHandlers = createChipRemoveHandler(values, onChange)

  return (
    <FilterSection label={t('listingCategory')}>
      <div className='space-y-3'>
        <ChipsList
          items={listingTypeChips}
          onRemove={chipRemoveHandlers.removeListingType}
        />
        <AddChipButton
          label={t('add')}
          onClick={() => onListingTypeSelectionChange?.(true)}
        />
      </div>
    </FilterSection>
  )
}
