import { ListingFilterValues } from '../ListingFilterContent'
import { POSTING_DATE_VALUES } from '../constants'

export interface FilterActionHelpers {
  getBackHandler: () => (() => void) | undefined
  getApplyDisabled: () => boolean
  handleApplyAction: () => void
}

export interface CreateFilterActionHelpersParams {
  contextValues: ListingFilterValues
  provinceDraft: string[]
  districtDraft: string[]
  wardDraft: string[]
  listingTypeDraft: string[]
  showProvinceSelection: boolean
  showDistrictSelection: boolean
  showWardSelection: boolean
  showListingTypeSelection: boolean
  showCustomRange: boolean
  handleFilterChange: (values: ListingFilterValues) => void
  onApply: () => void
  onProvinceSelectionChange?: (show: boolean) => void
  onDistrictSelectionChange?: (show: boolean) => void
  onWardSelectionChange?: (show: boolean) => void
  onListingTypeSelectionChange?: (show: boolean) => void
  onBackToMain?: () => void
}

export const createFilterActionHelpers = (
  params: CreateFilterActionHelpersParams,
): FilterActionHelpers => {
  const {
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
  } = params
  const getBackHandler = (): (() => void) | undefined => {
    if (showProvinceSelection) {
      return () => onProvinceSelectionChange?.(false)
    }

    if (showCustomRange) {
      return () => {
        handleFilterChange?.({
          ...contextValues,
          postingDate: POSTING_DATE_VALUES.DEFAULT,
          postingDateFrom: undefined,
          postingDateTo: undefined,
        })
        onBackToMain?.()
      }
    }

    if (showDistrictSelection) {
      return () => onDistrictSelectionChange?.(false)
    }

    if (showWardSelection) {
      return () => onWardSelectionChange?.(false)
    }

    if (showListingTypeSelection) {
      return () => onListingTypeSelectionChange?.(false)
    }

    return undefined
  }

  const getApplyDisabled = (): boolean => {
    if (showProvinceSelection) {
      return provinceDraft.length === 0 && !contextValues.provinceCodes?.length
    }

    if (showCustomRange) {
      return !contextValues.postingDateFrom || !contextValues.postingDateTo
    }

    return false
  }

  const applyLocationFilter = (
    draftValues: string[],
    currentValues: string[] | undefined,
    filterKey: keyof Pick<
      ListingFilterValues,
      'provinceCodes' | 'districtCodes' | 'wardCodes' | 'listingTypeCodes'
    >,
  ) => {
    if (currentValues !== draftValues) {
      handleFilterChange({
        ...contextValues,
        [filterKey]: draftValues.length ? draftValues : undefined,
      })
    }
  }

  const handleProvinceApply = () => {
    onProvinceSelectionChange?.(false)
    applyLocationFilter(
      provinceDraft,
      contextValues.provinceCodes,
      'provinceCodes',
    )
  }

  const handleDistrictApply = () => {
    onDistrictSelectionChange?.(false)
    applyLocationFilter(
      districtDraft,
      contextValues.districtCodes,
      'districtCodes',
    )
  }

  const handleWardApply = () => {
    onWardSelectionChange?.(false)
    applyLocationFilter(wardDraft, contextValues.wardCodes, 'wardCodes')
  }

  const handleListingTypeApply = () => {
    onListingTypeSelectionChange?.(false)
    applyLocationFilter(
      listingTypeDraft,
      contextValues.listingTypeCodes,
      'listingTypeCodes',
    )
  }

  const handleCustomRangeApply = () => {
    const hasValidDateRange =
      contextValues.postingDateFrom && contextValues.postingDateTo

    if (hasValidDateRange) {
      handleFilterChange({
        ...contextValues,
        postingDate: POSTING_DATE_VALUES.CUSTOM_APPLIED,
      })
    } else {
      handleFilterChange({
        ...contextValues,
        postingDate: POSTING_DATE_VALUES.DEFAULT,
        postingDateFrom: undefined,
        postingDateTo: undefined,
      })
    }
  }

  const handleApplyAction = () => {
    if (showProvinceSelection) return handleProvinceApply()
    if (showDistrictSelection) return handleDistrictApply()
    if (showWardSelection) return handleWardApply()
    if (showListingTypeSelection) return handleListingTypeApply()
    if (showCustomRange) return handleCustomRangeApply()

    onApply()
  }

  return {
    getBackHandler,
    getApplyDisabled,
    handleApplyAction,
  }
}
