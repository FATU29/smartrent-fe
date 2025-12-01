import { PATHS } from '@/api/paths'
import type { ApiResponse } from '@/configs/axios/types'
import { apiRequest } from '@/configs/axios/instance'
import type { ActiveCategoriesResponse } from '@/api/types/category.type'

export class CategoryService {
  static async getActiveCategories(): Promise<
    ApiResponse<ActiveCategoriesResponse>
  > {
    const response = await apiRequest<ActiveCategoriesResponse>({
      method: 'GET',
      url: PATHS.CATEGORY.ACTIVE,
    })

    return response
  }
}

export const { getActiveCategories } = CategoryService
