import React from 'react'
import { useTranslations } from 'next-intl'
import { FilterSection } from '@/components/atoms/filter-section'
import { AddChipButton } from '@/components/atoms/add-chip-button'
import { ChipsList } from '@/components/molecules/chips-list'
import { ListingFilterValues } from '../ListingFilterContent'
import { generateChipData } from '../utils/chipUtils'
import { createChipRemoveHandler } from '../utils/chipRemoveHandlers'

interface LocationFilterSectionProps {
  values: ListingFilterValues
  onChange: (v: ListingFilterValues) => void
  isDistrictEnabled: boolean
  isWardEnabled: boolean
  onProvinceSelectionChange?: (show: boolean) => void
  onDistrictSelectionChange?: (show: boolean) => void
  onWardSelectionChange?: (show: boolean) => void
}

export const LocationFilterSection: React.FC<LocationFilterSectionProps> = ({
  values,
  onChange,
  isDistrictEnabled,
  isWardEnabled,
  onProvinceSelectionChange,
  onDistrictSelectionChange,
  onWardSelectionChange,
}) => {
  const t = useTranslations('seller.listingManagement.filter')

  const provinceChips = generateChipData.provinces(values.provinceCodes)
  const districtChips = generateChipData.districts(values.districtCodes)
  const wardChips = generateChipData.wards(values.wardCodes)

  const chipRemoveHandlers = createChipRemoveHandler(values, onChange)

  return (
    <>
      <FilterSection label={t('province')}>
        <div className='space-y-3'>
          <ChipsList
            items={provinceChips}
            onRemove={chipRemoveHandlers.removeProvince}
          />
          <AddChipButton
            label={t('add')}
            onClick={() => onProvinceSelectionChange?.(true)}
          />
        </div>
        {values.provinceCodes && values.provinceCodes.length > 1 && (
          <div className='mt-2 text-xs text-muted-foreground leading-relaxed'>
            {t('selectExactlyOneProvince')}
          </div>
        )}
      </FilterSection>

      {isDistrictEnabled && (
        <FilterSection label={t('district')}>
          <div className='space-y-3'>
            <ChipsList
              items={districtChips}
              onRemove={chipRemoveHandlers.removeDistrict}
            />
            <AddChipButton
              label={t('add')}
              onClick={() => onDistrictSelectionChange?.(true)}
            />
          </div>
          {values.districtCodes?.length && (
            <div className='mt-2 text-xs text-muted-foreground leading-relaxed'>
              {t('filteringWardsIn')} {values.districtCodes.length}{' '}
              {t('district').toLowerCase()}
            </div>
          )}
        </FilterSection>
      )}

      <FilterSection label={t('ward')}>
        <div className='space-y-3'>
          <ChipsList
            items={wardChips}
            onRemove={chipRemoveHandlers.removeWard}
          />
          <AddChipButton
            label={t('add')}
            onClick={() => onWardSelectionChange?.(true)}
            disabled={!isWardEnabled}
          />
        </div>
        {!isWardEnabled && (
          <div className='mt-2 text-xs text-muted-foreground leading-relaxed'>
            {t('selectExactlyOneProvince')}
          </div>
        )}
      </FilterSection>
    </>
  )
}
