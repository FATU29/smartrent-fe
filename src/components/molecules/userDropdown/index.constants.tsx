import React from 'react'
import {
  LogOut,
  LayoutDashboard,
  FileText,
  Users,
  ShieldCheck,
  UserCog,
  BadgeCheck,
  Wallet,
} from 'lucide-react'
import { SELLERNET_ROUTES, SELLER_ROUTES } from '../../../constants/route'

export interface MenuItem {
  id: string
  icon: React.ReactNode
  label: string
  href?: string
  badge?: { text: string; variant?: 'primary' | 'neutral' | 'danger' }
  onClick?: () => void
}

export const badgeStyles: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground',
  neutral: 'bg-teal-100 text-teal-700',
  danger: 'bg-destructive text-destructive-foreground',
}

export const getMenuItems = (t: any): MenuItem[] => [
  {
    id: 'overview',
    icon: <LayoutDashboard className='h-4 w-4' />,
    label: t('userMenu.overview'),
    href: SELLER_ROUTES.OVERVIEW,
    badge: { text: t('common.new'), variant: 'primary' },
  },
  {
    id: 'listings',
    icon: <FileText className='h-4 w-4' />,
    label: t('userMenu.listings'),
    href: SELLER_ROUTES.LISTINGS,
  },
  {
    id: 'customers',
    icon: <Users className='h-4 w-4' />,
    label: t('userMenu.customers'),
    href: SELLER_ROUTES.CUSTOMERS,
  },
  {
    id: 'membership',
    icon: <ShieldCheck className='h-4 w-4' />,
    label: t('userMenu.membership'),
    href: SELLER_ROUTES.MEMBERSHIP,
    badge: {
      text: t('userMenu.savePercent', { percent: '-39%' }),
      variant: 'neutral',
    },
  },
  {
    id: 'topup',
    icon: <Wallet className='h-4 w-4' />,
    label: t('userMenu.topup'),
    href: SELLERNET_ROUTES.FINANCE_TOPUP,
  },
  {
    id: 'profile',
    icon: <UserCog className='h-4 w-4' />,
    label: t('userMenu.profile'),
    href: SELLERNET_ROUTES.PERSONAL_EDIT,
  },
  {
    id: 'proBroker',
    icon: <BadgeCheck className='h-4 w-4' />,
    label: t('userMenu.proBroker'),
    href: SELLERNET_ROUTES.PERSONAL_PRO_BROKER,
    badge: { text: t('common.new'), variant: 'primary' },
  },
]

export const getLogoutItem = (
  t: (key: string) => string,
  logoutUser: () => void,
): MenuItem => ({
  id: 'logout',
  icon: <LogOut className='h-4 w-4' />,
  label: t('homePage.auth.logout'),
  onClick: () => logoutUser(),
})
