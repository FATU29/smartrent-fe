import type { ListingFilterRequest } from '@/api/types'

// Count active filters based strictly on canonical ListingFilterRequest fields
export function countActiveFilters(
  filters: Partial<ListingFilterRequest>,
): number {
  return Object.entries(filters).filter(([key, value]) => {
    // Exclude pagination & keyword
    if (['keyword', 'page', 'size'].includes(key)) return false
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'boolean') return value
    return value !== undefined && value !== '' && value !== null
  }).length
}
