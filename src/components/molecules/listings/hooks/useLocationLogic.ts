import React from 'react'
import { ListingFilterValues } from '../ListingFilterContent'

export const useLocationLogic = (
  values: ListingFilterValues,
  onChange: (v: ListingFilterValues) => void,
) => {
  // Check if exactly one province is selected to enable ward selection
  const selectedProvinceCode =
    values.provinceCodes?.length === 1 ? values.provinceCodes[0] : undefined
  const isWardEnabled = !!selectedProvinceCode

  // District selection is enabled when multiple provinces are selected
  const isDistrictEnabled =
    !!values.provinceCodes?.length && values.provinceCodes.length > 1

  // Clear districts and wards when province selection changes to multiple or none
  React.useEffect(() => {
    if (
      !isWardEnabled &&
      (values.districtCodes?.length || values.wardCodes?.length)
    ) {
      onChange({
        ...values,
        districtCodes: undefined,
        wardCodes: undefined,
      })
    }
  }, [isWardEnabled, values, onChange])

  // Clear wards when districts are cleared (for multiple province selection)
  React.useEffect(() => {
    if (
      isDistrictEnabled &&
      !values.districtCodes?.length &&
      values.wardCodes?.length
    ) {
      onChange({
        ...values,
        wardCodes: undefined,
      })
    }
  }, [isDistrictEnabled, values.districtCodes, values.wardCodes, onChange])

  return {
    selectedProvinceCode,
    isWardEnabled,
    isDistrictEnabled,
  }
}
