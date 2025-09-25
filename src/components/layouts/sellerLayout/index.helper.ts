import { SELLER_ROUTES } from '@/constants'
import {
  BadgePercent,
  FileText,
  PieChart,
  Plus,
  User,
  Users,
} from 'lucide-react'

// Map of navigation items and routes used in both sidebar and bottom nav
type SellerNavKey =
  | 'overview'
  | 'listings'
  | 'create'
  | 'customers'
  | 'membership'
  | 'account'

export type SellerNavItem = {
  key: SellerNavKey
  href: string
  icon: React.ComponentType<{ className?: string }>
  // visibility/placement controls (so UI updates by editing config only)
  showOnDesktop?: boolean
  showOnMobile?: boolean
  mobilePlacement?: 'normal' | 'centerAction'
  mobileOrder?: number
  children?: SellerNavItem[]
}

// Single source of truth for seller navigation
export const NAV_ITEMS: SellerNavItem[] = [
  {
    key: 'overview',
    href: SELLER_ROUTES.OVERVIEW,
    icon: PieChart,
    showOnDesktop: true,
    showOnMobile: true,
    mobilePlacement: 'normal',
    mobileOrder: 1,
  },
  {
    key: 'listings',
    href: SELLER_ROUTES.LISTINGS,
    icon: FileText,
    showOnDesktop: true,
    showOnMobile: true,
    mobilePlacement: 'normal',
    mobileOrder: 2,
  },
  // create is the center floating action on mobile, also visible in desktop sidebar
  {
    key: 'create',
    href: SELLER_ROUTES.CREATE,
    icon: Plus,
    showOnDesktop: true,
    showOnMobile: true,
    mobilePlacement: 'centerAction',
    mobileOrder: 3,
  },
  {
    key: 'customers',
    href: SELLER_ROUTES.CUSTOMERS,
    icon: Users,
    showOnDesktop: true,
    showOnMobile: true,
    mobilePlacement: 'normal',
    mobileOrder: 4,
  },
  {
    key: 'membership',
    href: SELLER_ROUTES.MEMBERSHIP,
    icon: BadgePercent,
    showOnDesktop: true,
    showOnMobile: false,
    mobilePlacement: 'normal',
    mobileOrder: 5,
  },
  {
    key: 'account',
    href: SELLER_ROUTES.ACCOUNT,
    icon: User,
    showOnDesktop: true,
    showOnMobile: true,
    mobilePlacement: 'normal',
    mobileOrder: 6,
  },
]
