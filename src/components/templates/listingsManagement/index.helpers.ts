import { ListFilters } from '@/contexts/list'

export const createMockListingsFetcher = () => {
  return async (filters: ListFilters) => {
    // TODO: Replace with real API call
    console.log('Fetching with filters:', filters)
    // Mock API response
    return {
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    }
  }
}

export const createDialogHandlers = (
  setFilterOpen: (open: boolean) => void,
  setShowProvinceSelection: (show: boolean) => void,
  setShowDistrictSelection: (show: boolean) => void,
  setShowWardSelection: (show: boolean) => void,
  setShowListingTypeSelection: (show: boolean) => void,
) => {
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
    // Custom date range reset is now handled by the List context
  }

  return {
    handleFilterOpen,
    handleFilterApply,
    handleResetAllSelections,
    handleBackToMain,
  }
}
