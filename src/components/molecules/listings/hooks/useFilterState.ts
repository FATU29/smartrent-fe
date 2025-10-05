import React from 'react'
import { ListingFilterValues } from '../ListingFilterContent'

interface UseFilterStateProps {
  values: ListingFilterValues
  showProvinceSelection: boolean
  showDistrictSelection: boolean
  showWardSelection: boolean
  showListingTypeSelection: boolean
}

export const useFilterState = ({
  values,
  showProvinceSelection,
  showDistrictSelection,
  showWardSelection,
  showListingTypeSelection,
}: UseFilterStateProps) => {
  // Draft states for selections
  const [provinceDraft, setProvinceDraft] = React.useState<string[]>(
    values.provinceCodes || [],
  )
  const [districtDraft, setDistrictDraft] = React.useState<string[]>(
    values.districtCodes || [],
  )
  const [wardDraft, setWardDraft] = React.useState<string[]>(
    values.wardCodes || [],
  )
  const [listingTypeDraft, setListingTypeDraft] = React.useState<string[]>(
    values.listingTypeCodes || [],
  )

  // Sync draft states when dialogs open
  React.useEffect(() => {
    if (showProvinceSelection) {
      setProvinceDraft(values.provinceCodes || [])
    }
  }, [showProvinceSelection, values.provinceCodes])

  React.useEffect(() => {
    if (showDistrictSelection) {
      setDistrictDraft(values.districtCodes || [])
    }
  }, [showDistrictSelection, values.districtCodes])

  React.useEffect(() => {
    if (showWardSelection) {
      setWardDraft(values.wardCodes || [])
    }
  }, [showWardSelection, values.wardCodes])

  React.useEffect(() => {
    if (showListingTypeSelection) {
      setListingTypeDraft(values.listingTypeCodes || [])
    }
  }, [showListingTypeSelection, values.listingTypeCodes])

  // Toggle functions
  const toggleProvince = (code: string) => {
    setProvinceDraft((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  const toggleDistrict = (code: string) => {
    setDistrictDraft((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  const toggleWard = (code: string) => {
    setWardDraft((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  const toggleListingType = (code: string) => {
    setListingTypeDraft((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  return {
    // Draft states
    provinceDraft,
    districtDraft,
    wardDraft,
    listingTypeDraft,
    // Setters
    setProvinceDraft,
    setDistrictDraft,
    setWardDraft,
    setListingTypeDraft,
    // Toggle functions
    toggleProvince,
    toggleDistrict,
    toggleWard,
    toggleListingType,
  }
}
