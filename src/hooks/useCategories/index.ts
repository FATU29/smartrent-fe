import { useQuery } from '@tanstack/react-query'
import { CategoryService } from '@/api/services'
import type { CategoryApi } from '@/api/types/category.type'

export const useCategories = () => {
  return useQuery<{ categories: CategoryApi[]; raw: CategoryApi[] } | null>({
    queryKey: ['categories', 'active'],
    queryFn: async () => {
      const { data, success } = await CategoryService.getActiveCategories()
      if (!success) {
        throw new Error('Failed to fetch active categories')
      }
      const list = (data ?? []) as CategoryApi[]
      return { categories: list, raw: list }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  })
}
