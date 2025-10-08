import { ListFilters } from '@/contexts/list'
import { ListingFilterValues } from '../ListingFilterContent'

export const mapToListFilters = (
  values: ListingFilterValues,
): Partial<ListFilters> => {
  const filters: Partial<ListFilters> = {}

  // Map posting date filters
  if (values.postingDate) {
    // Store custom posting date logic
    filters['postingDate'] = values.postingDate
  }
  if (values.postingDateFrom) {
    filters['postingDateFrom'] = values.postingDateFrom
  }
  if (values.postingDateTo) {
    filters['postingDateTo'] = values.postingDateTo
  }

  // Map location filters
  if (values.provinceCodes?.length) {
    filters['provinceCodes'] = values.provinceCodes
  }
  if (values.districtCodes?.length) {
    filters['districtCodes'] = values.districtCodes
  }
  if (values.wardCodes?.length) {
    filters['wardCodes'] = values.wardCodes
  }

  // Map listing type to property type
  if (values.listingTypeCodes?.length) {
    filters['listingTypeCodes'] = values.listingTypeCodes
  }

  return filters
}

export const mapFromListFilters = (
  filters: ListFilters,
): ListingFilterValues => {
  return {
    postingDate: filters['postingDate'] as string,
    postingDateFrom: filters['postingDateFrom'] as string,
    postingDateTo: filters['postingDateTo'] as string,
    provinceCodes: filters['provinceCodes'] as string[],
    districtCodes: filters['districtCodes'] as string[],
    wardCodes: filters['wardCodes'] as string[],
    listingTypeCodes: filters['listingTypeCodes'] as string[],
  }
}
