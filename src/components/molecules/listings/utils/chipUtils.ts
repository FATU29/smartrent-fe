import {
  VIETNAM_PROVINCES,
  VIETNAM_LISTING_TYPES,
  findWardByCode,
  findDistrictByCode,
} from '@/constants'

export interface ChipData {
  code: string
  name: string
}

export const generateChipData = {
  provinces: (codes: string[] = []): ChipData[] =>
    codes.map((code) => {
      const province = VIETNAM_PROVINCES.find((p) => p.code === code)
      return { code, name: province?.name || code }
    }),

  districts: (codes: string[] = []): ChipData[] =>
    codes.map((code) => {
      const district = findDistrictByCode(code)
      return { code, name: district?.name || code }
    }),

  wards: (codes: string[] = []): ChipData[] =>
    codes.map((code) => {
      const ward = findWardByCode(code)
      return { code, name: ward?.name || code }
    }),

  listingTypes: (codes: string[] = []): ChipData[] =>
    codes.map((code) => {
      const listingType = VIETNAM_LISTING_TYPES.find((lt) => lt.code === code)
      return { code, name: listingType?.name || code }
    }),
}
