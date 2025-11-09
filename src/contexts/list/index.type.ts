export const DEFAULT_PER_PAGE = 5
export const DEFAULT_PAGE = 1
export const DEFAULT_SEARCH = ''

export interface ListFilters {
  search: string
  perPage: number
  page: number
  // Property-specific filters
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  bedrooms?: number
  bathrooms?: number
  propertyType?: string
  city?: string
  amenities?: { id: number; name?: string }[] // Array of amenity objects with id and optional name
  // Extended residential specific filters
  verified?: boolean
  professionalBroker?: boolean
  orientation?: string
  moveInTime?: string
  electricityPrice?: string
  waterPrice?: string
  internetPrice?: string
  minFrontage?: number
  maxFrontage?: number
  hasVideo?: boolean
  has360?: boolean
  // Location & Project (cascading)
  // Legacy structure (63 provinces)
  province?: string
  district?: string
  ward?: string
  // New structure (34 provinces)
  newProvinceCode?: string
  newWardCode?: string
  // Common fields
  streetId?: string
  projectId?: string
  addressStructureType?: 'legacy' | 'new'
  searchAddress?: string
  addressEdited?: boolean
  [key: string]: unknown
}

export interface ListFetcherResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ListContextType<T = unknown> {
  itemsData: T[]
  filters: ListFilters
  pagination: {
    total: number
    page: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
  handleUpdateFilter: (filterObject: Partial<ListFilters>) => Promise<void>
  handleResetFilter: () => Promise<void>
  handleLoadMore: () => Promise<void>
  handleLoadNewPage: (newPage: number) => Promise<void>
  isLoading: boolean
  activeCount: number
}
