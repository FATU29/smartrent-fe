import { ListingFilterValues } from '../ListingFilterContent'

export const createChipRemoveHandler = (
  values: ListingFilterValues,
  onChange: (v: ListingFilterValues) => void,
) => ({
  removeProvince: (code: string) => {
    const newCodes = values.provinceCodes?.filter((c) => c !== code) || []
    onChange({
      ...values,
      provinceCodes: newCodes.length ? newCodes : undefined,
    })
  },

  removeDistrict: (code: string) => {
    const newCodes = values.districtCodes?.filter((c) => c !== code) || []
    onChange({
      ...values,
      districtCodes: newCodes.length ? newCodes : undefined,
    })
  },

  removeWard: (code: string) => {
    const newCodes = values.wardCodes?.filter((c) => c !== code) || []
    onChange({ ...values, wardCodes: newCodes.length ? newCodes : undefined })
  },

  removeListingType: (code: string) => {
    const newCodes = values.listingTypeCodes?.filter((c) => c !== code) || []
    onChange({
      ...values,
      listingTypeCodes: newCodes.length ? newCodes : undefined,
    })
  },
})
