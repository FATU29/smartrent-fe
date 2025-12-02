export type CategoryValue = 'room' | 'apartment' | 'house' | 'office' | 'store'

export interface CategoryItem {
  id: number
  name: string // Deprecated: use translation via getCategoryName() instead
  slug: string // Keep as-is, no translation needed
  description: string
  value: CategoryValue // Category values: room, apartment, house, office, store
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 1,
    name: 'Cho thuê phòng trọ',
    slug: 'cho-thue-phong-tro',
    description: 'Phòng trọ giá rẻ, phòng trọ sinh viên',
    value: 'room',
  },
  {
    id: 2,
    name: 'Cho thuê căn hộ',
    slug: 'cho-thue-can-ho',
    description: 'Căn hộ chung cư, căn hộ dịch vụ',
    value: 'apartment',
  },
  {
    id: 3,
    name: 'Cho thuê nhà nguyên căn',
    slug: 'cho-thue-nha-nguyen-can',
    description: 'Nhà nguyên căn, villa, biệt thự',
    value: 'house',
  },
  {
    id: 4,
    name: 'Cho thuê văn phòng',
    slug: 'cho-thue-van-phong',
    description: 'Văn phòng, mặt bằng kinh doanh',
    value: 'office',
  },
  {
    id: 5,
    name: 'Cho thuê mặt bằng',
    slug: 'cho-thue-mat-bang',
    description: 'Mặt bằng kinh doanh, cửa hàng',
    value: 'store',
  },
] as const

/**
 * Get category by id
 */
export const getCategoryById = (id: number): CategoryItem | undefined => {
  return CATEGORIES.find((category) => category.id === id)
}

/**
 * Get category by slug
 */
export const getCategoryBySlug = (slug: string): CategoryItem | undefined => {
  return CATEGORIES.find((category) => category.slug === slug)
}

/**
 * Get category by value
 */
export const getCategoryByValue = (value: string): CategoryItem | undefined => {
  return CATEGORIES.find(
    (category) => category.value.toLowerCase() === value.toLowerCase(),
  )
}
