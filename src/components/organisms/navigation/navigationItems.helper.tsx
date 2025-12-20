import { NavigationItemData } from '@/components/atoms/navigation-item'
import { Building2, Newspaper, Heart, GitCompare } from 'lucide-react'
import type { CategoryApi } from '@/api/types/category.type'

export const getNavigationItems = (
  activeItem: string,
  t: (key: string) => string,
  tCommon: (key: string) => string, // Translation function for 'common' namespace
  categories?: CategoryApi[],
): NavigationItemData[] => {
  const categoryChildren = (categories ?? []).map((category) => ({
    id: category.slug,
    label: category.name,
    href: `/properties?categoryId=${category.categoryId}`,
    isActive: activeItem === category.slug,
  }))
  return [
    {
      id: 'properties',
      label: t('navigation.properties'),
      href: '/properties',
      icon: <Building2 className='h-4 w-4' />,
      isActive: activeItem === 'properties',
      children: categoryChildren,
    },
    {
      id: 'news',
      label: t('navigation.news'),
      href: '/news',
      icon: <Newspaper className='h-4 w-4' />,
      isActive: activeItem === 'news',
    },
    {
      id: 'savedListings',
      label: t('navigation.savedListings'),
      href: '/saved-listings',
      icon: <Heart className='h-4 w-4' />,
      isActive: activeItem === 'savedListings',
    },
    {
      id: 'compare',
      label: t('navigation.compare'),
      href: '/compare',
      icon: <GitCompare className='h-4 w-4' />,
      isActive: activeItem === 'compare',
    },
  ]
}
