/**
 * Draft types for listing drafts
 */
export interface Draft {
  id: number
  listingId?: number
  title?: string
  description?: string
  address?: string
  propertyType?: string
  price?: number
  area?: number
  bedrooms?: number
  bathrooms?: number
  images?: string[]
  createdAt: string
  updatedAt: string
  status?: 'draft' | 'pending' | 'published'
}
