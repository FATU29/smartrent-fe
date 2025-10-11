import React from 'react'
import { useListContext } from '@/contexts/list'
import { ProvinceSelectionDialog } from '@/components/molecules/province-selection-dialog'
import { DistrictSelectionDialog } from '@/components/molecules/districtSelectionDialog'
import { WardSelectionDialog } from '@/components/molecules/ward-selection-dialog'
import { ListingTypeSelectionDialog } from '@/components/molecules/listing-type-selection-dialog'
import { FilterActionButtons } from '@/components/molecules/filter-action-buttons'
import { DateFilterSection } from './sections/DateFilterSection'
import { LocationFilterSection } from './sections/LocationFilterSection'
import { ListingTypeFilterSection } from './sections/ListingTypeFilterSection'
import { useFilterState } from './hooks/useFilterState'
import { useLocationLogic } from './hooks/useLocationLogic'
import { POSTING_DATE_VALUES } from './constants'
import { mapToListFilters, mapFromListFilters } from './utils/listFiltersMapper'
import { createFilterActionHelpers } from './utils/filterActionHelpers'

export interface ListingFilterValues {
  postingDate?: string
  postingDateFrom?: string
  postingDateTo?: string
  provinceCodes?: string[]
  districtCodes?: string[]
  wardCodes?: string[]
  listingTypeCodes?: string[]
}

export interface ListingFilterContentProps {
  onApply: () => void
  showProvinceSelection?: boolean
  onProvinceSelectionChange?: (show: boolean) => void
  showDistrictSelection?: boolean
  onDistrictSelectionChange?: (show: boolean) => void
  showWardSelection?: boolean
  onWardSelectionChange?: (show: boolean) => void
  showListingTypeSelection?: boolean
  onListingTypeSelectionChange?: (show: boolean) => void
  onCustomRangeChange?: (show: boolean) => void
  onBackToMain?: () => void
}

export const ListingFilterContent: React.FC<ListingFilterContentProps> = ({
  onApply,
  showProvinceSelection: externalShowProvinceSelection,
  onProvinceSelectionChange,
  showDistrictSelection: externalShowDistrictSelection,
  onDistrictSelectionChange,
  showWardSelection: externalShowWardSelection,
  onWardSelectionChange,
  showListingTypeSelection: externalShowListingTypeSelection,
  onListingTypeSelectionChange,
  onCustomRangeChange,
  onBackToMain,
}) => {
  const { filters, handleUpdateFilter, handleResetFilter } = useListContext()

  const contextValues = mapFromListFilters(filters)

  const handleFilterChange = (newValues: ListingFilterValues) => {
    const listFilters = mapToListFilters(newValues)
    handleUpdateFilter(listFilters)
  }

  const showCustomRange =
    contextValues.postingDate === POSTING_DATE_VALUES.CUSTOM
  const showProvinceSelection = externalShowProvinceSelection || false
  const showDistrictSelection = externalShowDistrictSelection || false
  const showWardSelection = externalShowWardSelection || false
  const showListingTypeSelection = externalShowListingTypeSelection || false

  const {
    provinceDraft,
    districtDraft,
    wardDraft,
    listingTypeDraft,
    setProvinceDraft,
    setDistrictDraft,
    setWardDraft,
    setListingTypeDraft,
    toggleProvince,
    toggleDistrict,
    toggleWard,
    toggleListingType,
  } = useFilterState({
    values: contextValues,
    showProvinceSelection,
    showDistrictSelection,
    showWardSelection,
    showListingTypeSelection,
  })

  const { selectedProvinceCode, isWardEnabled, isDistrictEnabled } =
    useLocationLogic(contextValues, handleFilterChange)

  const filterActionHelpers = createFilterActionHelpers({
    contextValues,
    provinceDraft,
    districtDraft,
    wardDraft,
    listingTypeDraft,
    showProvinceSelection,
    showDistrictSelection,
    showWardSelection,
    showListingTypeSelection,
    showCustomRange,
    handleFilterChange,
    onApply,
    onProvinceSelectionChange,
    onDistrictSelectionChange,
    onWardSelectionChange,
    onListingTypeSelectionChange,
    onBackToMain,
  })

  const handleReset = () => {
    if (showProvinceSelection) {
      setProvinceDraft([])
    } else if (showDistrictSelection) {
      setDistrictDraft([])
    } else if (showWardSelection) {
      setWardDraft([])
    } else if (showListingTypeSelection) {
      setListingTypeDraft([])
    } else {
      handleResetFilter()
    }
  }

  const getCurrentView = () => {
    if (showCustomRange) {
      return (
        <DateFilterSection
          values={contextValues}
          onChange={handleFilterChange}
          onCustomRangeChange={onCustomRangeChange}
          showCustomRange={showCustomRange}
        />
      )
    }

    if (showProvinceSelection) {
      return (
        <ProvinceSelectionDialog
          provinceDraft={provinceDraft}
          onToggleProvince={toggleProvince}
        />
      )
    }

    if (showDistrictSelection) {
      return (
        <DistrictSelectionDialog
          selectedProvinceCode={selectedProvinceCode!}
          districtDraft={districtDraft}
          onToggleDistrict={toggleDistrict}
        />
      )
    }

    if (showWardSelection) {
      return (
        <WardSelectionDialog
          selectedDistrictCodes={
            isWardEnabled && !isDistrictEnabled
              ? []
              : contextValues.districtCodes || []
          }
          selectedProvinceCode={
            isWardEnabled && !isDistrictEnabled
              ? selectedProvinceCode
              : undefined
          }
          wardDraft={wardDraft}
          onToggleWard={toggleWard}
        />
      )
    }

    if (showListingTypeSelection) {
      return (
        <ListingTypeSelectionDialog
          listingTypeDraft={listingTypeDraft}
          onToggleListingType={toggleListingType}
        />
      )
    }

    return (
      <>
        <DateFilterSection
          values={contextValues}
          onChange={handleFilterChange}
          onCustomRangeChange={onCustomRangeChange}
          showCustomRange={showCustomRange}
        />

        <LocationFilterSection
          values={contextValues}
          onChange={handleFilterChange}
          isDistrictEnabled={isDistrictEnabled}
          isWardEnabled={isWardEnabled}
          onProvinceSelectionChange={onProvinceSelectionChange}
          onDistrictSelectionChange={onDistrictSelectionChange}
          onWardSelectionChange={onWardSelectionChange}
        />

        <ListingTypeFilterSection
          values={contextValues}
          onChange={handleFilterChange}
          onListingTypeSelectionChange={onListingTypeSelectionChange}
        />

        <div className='h-4' />
      </>
    )
  }

  return (
    <div className='relative flex h-[calc(100%-40px)] flex-col w-full justify-between'>
      <div className='overflow-y-auto min-h-0'>
        <div className='space-y-4 sm:space-y-6'>{getCurrentView()}</div>
      </div>
      <FilterActionButtons
        onReset={handleReset}
        onApply={filterActionHelpers.handleApplyAction}
        onBack={filterActionHelpers.getBackHandler()}
        applyDisabled={filterActionHelpers.getApplyDisabled()}
      />
    </div>
  )
}
