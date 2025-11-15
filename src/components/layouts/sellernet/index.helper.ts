import { SELLERNET_ROUTES } from '@/constants'
import {
  FileText,
  ListChecks,
  StickyNote,
  BookmarkCheck,
  Users,
  BadgePercent,
  ListOrdered,
  Plus,
  User,
  TicketPercent,
} from 'lucide-react'

export type SellernetNavItem = {
  key: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: SellernetNavItem[]
  className?: string
}

export const SELLERNET_NAV: SellernetNavItem[] = [
  {
    key: 'sellernet.overview',
    href: SELLERNET_ROUTES.OVERVIEW,
    icon: ListOrdered,
    className: 'text-base',
  },
  {
    key: 'sellernet.postManagement',
    icon: FileText,
    children: [
      {
        key: 'sellernet.create',
        href: SELLERNET_ROUTES.POST_CREATE,
        icon: Plus,
      },
      {
        key: 'sellernet.list',
        href: SELLERNET_ROUTES.POST_LIST,
        icon: ListChecks,
      },
      {
        key: 'sellernet.drafts',
        href: SELLERNET_ROUTES.POST_DRAFTS,
        icon: StickyNote,
      },
      {
        key: 'sellernet.sponsored',
        href: SELLERNET_ROUTES.POST_SPONSORED,
        icon: BookmarkCheck,
      },
    ],
  },
  {
    key: 'sellernet.customers',
    href: SELLERNET_ROUTES.CUSTOMERS,
    icon: Users,
    className: 'text-base',
  },
  {
    key: 'sellernet.membership',
    icon: BadgePercent,
    children: [
      {
        key: 'sellernet.membershipRegister',
        href: SELLERNET_ROUTES.MEMBERSHIP_REGISTER,
      },
    ],
  },
  {
    key: 'sellernet.personalAccount',
    icon: User,
    children: [
      { key: 'sellernet.editPersonal', href: SELLERNET_ROUTES.PERSONAL_EDIT },
      {
        key: 'sellernet.accountSettings',
        href: SELLERNET_ROUTES.PERSONAL_SETTINGS,
      },
    ],
  },
  {
    key: 'sellernet.pricingGuide',
    icon: TicketPercent,
    children: [
      { key: 'sellernet.pricing', href: SELLERNET_ROUTES.PRICING },
      { key: 'sellernet.paymentGuide', href: SELLERNET_ROUTES.PAYMENT_GUIDE },
      { key: 'sellernet.usageGuide', href: SELLERNET_ROUTES.USAGE_GUIDE },
    ],
  },
]
