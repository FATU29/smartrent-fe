import type { ListFilters } from '@/contexts/list/index.type'

/**
 * Count active filters, excluding pagination and internal fields
 * Also respects address structure type to count only visible fields
 */
export function countActiveFilters(filters: Partial<ListFilters>): number {
  const isLegacyMode = filters.addressStructureType !== 'new'

  return Object.entries(filters).filter(([key, value]) => {
    // Exclude pagination and internal fields
    if (
      [
        'search',
        'page',
        'perPage',
        'addressStructureType',
        'searchAddress',
        'addressEdited',
      ].includes(key)
    ) {
      return false
    }

    // Exclude opposite address structure fields so only visible ones count
    if (isLegacyMode && ['newProvinceCode', 'newWardCode'].includes(key)) {
      return false
    }
    if (!isLegacyMode && ['province', 'district', 'ward'].includes(key)) {
      return false
    }

    // Standard counting rules
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'boolean') return value
    return value !== undefined && value !== '' && value !== null
  }).length
}
