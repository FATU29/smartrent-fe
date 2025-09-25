import { NavigationItemData } from '@/components/atoms/navigation-item'
import { Home as HomeIcon, Building2, Users } from 'lucide-react'

export const getNavigationItems = (
  activeItem: string,
  t: (key: string) => string,
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
      children: [
        {
          id: 'residential',
          label: t('navigation.residential'),
          href: '/properties/residential',
          isActive: activeItem === 'residential',
        },
        {
          id: 'commercial',
          label: t('navigation.commercial'),
          href: '/properties/commercial',
          isActive: activeItem === 'commercial',
        },
        {
          id: 'vacation',
          label: t('navigation.vacation'),
          href: '/properties/vacation',
          isActive: activeItem === 'vacation',
        },
      ],
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
