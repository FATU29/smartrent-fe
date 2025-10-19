import React from 'react'
import { ListingFilterValues } from '../ListingFilterContent'

interface UseFilterStateProps {
  values: ListingFilterValues
}

export const useFilterState = ({ values }: UseFilterStateProps) => {
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

  // Sync drafts with applied values when they change, but do not reset on view toggles
  React.useEffect(() => {
    setProvinceDraft(values.provinceCodes || [])
  }, [values.provinceCodes])

  React.useEffect(() => {
    setDistrictDraft(values.districtCodes || [])
  }, [values.districtCodes])

  React.useEffect(() => {
    setWardDraft(values.wardCodes || [])
  }, [values.wardCodes])

  React.useEffect(() => {
    setListingTypeDraft(values.listingTypeCodes || [])
  }, [values.listingTypeCodes])

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
