export interface CategoryApi {
  categoryId: number
  name: string
  slug: string
  description: string
  icon: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ActiveCategoriesResponse = CategoryApi[]
