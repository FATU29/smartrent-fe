export interface ListingPreview {
  id: string
}

export interface ListingsManagementState {
  status: string
  filterOpen: boolean
  showProvinceSelection: boolean
  showDistrictSelection: boolean
  showWardSelection: boolean
  showListingTypeSelection: boolean
}

export interface ListingsCounts {
  all: number
  expired: number
  expiring: number
  active: number
  pending: number
  review: number
  payment: number
  rejected: number
  archived: number
}
