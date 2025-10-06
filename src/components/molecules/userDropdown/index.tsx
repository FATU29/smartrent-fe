import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'
import { Avatar } from '@/components/atoms/avatar'
import { Button } from '@/components/atoms/button'
import { useAuth, useLogout } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
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
import { cn, getUserInitials } from '@/lib/utils'
import Link from 'next/link'
import { SELLERNET_ROUTES, SELLER_ROUTES } from '@/constants/route'

interface MenuItem {
  id: string
  icon: React.ReactNode
  label: string
  href?: string
  badge?: { text: string; variant?: 'primary' | 'neutral' | 'danger' }
  onClick?: () => void
}

const badgeStyles: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground',
  neutral: 'bg-teal-100 text-teal-700',
  danger: 'bg-destructive text-destructive-foreground',
}

const UserDropdown: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const { logoutUser } = useLogout()
  const t = useTranslations()

  if (!isAuthenticated || !user) return null

  const items: MenuItem[] = [
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

  const logoutItem: MenuItem = {
    id: 'logout',
    icon: <LogOut className='h-4 w-4' />,
    label: t('homePage.auth.logout'),
    onClick: () => logoutUser(),
  }

  const getInitials = (first: string, last: string) =>
    getUserInitials(first, last)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-9 w-9 rounded-full'>
          <Avatar className='h-9 w-9'>
            <div className='flex items-center justify-center h-full w-full bg-primary text-primary-foreground text-sm font-medium'>
              {getInitials(user.firstName, user.lastName)}
            </div>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='p-0 overflow-hidden rounded-xl overflow-x-hidden w-auto min-w-[16rem] max-w-[20rem]'
      >
        <div className='p-5 bg-gradient-to-br from-primary via-blue-700 to-blue-800 text-white relative'>
          <div className='absolute inset-0 opacity-30 bg-[url(/images/rental-auth-bg.jpg)] bg-cover bg-right-top mix-blend-lighten' />
          <div className='relative'>
            <h3 className='text-base font-semibold mb-1'>
              {t('userMenu.membershipPackage')}
            </h3>
            <p className='text-xs leading-snug opacity-90 mb-3 max-w-[200px]'>
              {t('userMenu.membershipBenefit')}
            </p>
            <Button size='sm' className='bg-primary hover:bg-blue-600' asChild>
              <Link href={SELLER_ROUTES.MEMBERSHIP}>
                {t('common.learnMore')}
              </Link>
            </Button>
          </div>
        </div>
        <div className='py-2 max-h-[420px] overflow-y-auto overflow-x-hidden'>
          {items.map((item) => {
            const ItemContent = () => (
              <>
                {item.icon}
                <span className='flex-1 text-foreground'>{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap',
                      badgeStyles[item.badge.variant || 'primary'],
                    )}
                  >
                    {item.badge.text}
                  </span>
                )}
              </>
            )

            return (
              <DropdownMenuItem
                key={item.id}
                asChild={!!item.href && !item.onClick}
                onClick={item.onClick}
                className='cursor-pointer px-4 py-2.5 text-sm flex items-center gap-3'
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className='flex items-center gap-3 w-full'
                  >
                    <ItemContent />
                  </Link>
                ) : (
                  <div className='flex items-center gap-3 w-full'>
                    <ItemContent />
                  </div>
                )}
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator className='my-2' />
          <DropdownMenuItem
            onClick={logoutItem.onClick}
            className='cursor-pointer px-4 py-2.5 text-sm flex items-center gap-3 text-destructive focus:text-destructive'
          >
            {logoutItem.icon}
            <span className='flex-1'>{logoutItem.label}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserDropdown
