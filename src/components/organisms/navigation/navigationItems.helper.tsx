import { NavigationItemData } from '@/components/atoms/navigation-item'
import { Home as HomeIcon, Building2, Users } from 'lucide-react'
import {
  PROPERTY_TYPES,
  getPropertyTypeName,
} from '@/constants/common/propertyTypes'

export const getNavigationItems = (
  activeItem: string,
  t: (key: string) => string,
  tCommon: (key: string) => string, // Translation function for 'common' namespace
): NavigationItemData[] => {
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
      children: PROPERTY_TYPES.map((type) => ({
        id: type.slug,
        label: getPropertyTypeName(type.id, tCommon), // Use translation by id
        href: `/properties?category=${type.slug}`, // Keep slug as-is
        isActive: activeItem === type.slug,
      })),
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
