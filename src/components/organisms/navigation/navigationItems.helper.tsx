import { NavigationItemData } from '@/components/atoms/navigation-item'
import { Home as HomeIcon, Building2, Users } from 'lucide-react'
import { getCategoryName } from '@/constants/common/category'
import type { CategoryApi } from '@/api/types/category.type'

export const getNavigationItems = (
  activeItem: string,
  t: (key: string) => string,
  tCommon: (key: string) => string, // Translation function for 'common' namespace
  categories?: CategoryApi[],
): NavigationItemData[] => {
  const categoryChildren = (categories ?? []).map((category) => ({
    id: category.slug,
    label: getCategoryName(category.categoryId, tCommon) || category.name,
    href: `/properties?categoryId=${category.categoryId}`,
    isActive: activeItem === category.slug,
  }))
  return [
    {
      id: 'home',
      label: t('navigation.home'),
      href: '/',
      icon: <HomeIcon className='h-4 w-4' />,
      isActive: activeItem === 'home',
    },
    {
      id: 'properties',
      label: t('navigation.properties'),
      href: '/properties',
      icon: <Building2 className='h-4 w-4' />,
      isActive: activeItem === 'properties',
      children: categoryChildren,
    },
    {
      id: 'tenants',
      label: t('navigation.tenants'),
      href: '/tenants',
      icon: <Users className='h-4 w-4' />,
      isActive: activeItem === 'tenants',
      children: [
        {
          id: 'applications',
          label: t('navigation.applications'),
          href: '/tenants/applications',
          isActive: activeItem === 'applications',
        },
        {
          id: 'leases',
          label: t('navigation.leases'),
          href: '/tenants/leases',
          isActive: activeItem === 'leases',
        },
        {
          id: 'maintenance',
          label: t('navigation.maintenance'),
          href: '/tenants/maintenance',
          isActive: activeItem === 'maintenance',
        },
      ],
    },
    // Removed documents, calendar, analytics from navigation per request
  ]
}
