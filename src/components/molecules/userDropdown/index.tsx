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
import { cn, getUserInitials } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { SELLER_ROUTES } from '@/constants/route'
import {
  type MenuItem,
  badgeStyles,
  getMenuItems,
  getLogoutItem,
} from './index.constants'

const UserDropdown: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const { logoutUser } = useLogout()
  const t = useTranslations()

  if (!isAuthenticated || !user) return null

  const items: MenuItem[] = getMenuItems(t)
  const logoutItem: MenuItem = getLogoutItem(t, logoutUser)

  const getInitials = (first: string, last: string) =>
    getUserInitials(first, last)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-9 w-9 rounded-full'>
          <Avatar className='h-9 w-9'>
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                fill
                className='object-cover'
                sizes='36px'
              />
            ) : (
              <div className='flex items-center justify-center h-full w-full bg-primary text-primary-foreground text-sm font-medium'>
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='p-0 overflow-hidden rounded-xl overflow-x-hidden w-auto min-w-[16rem] max-w-[20rem]'
      >
        <div className='p-5 bg-gradient-to-br from-primary via-blue-700 to-blue-800 text-white relative overflow-hidden'>
          <div className='absolute inset-0 opacity-30 mix-blend-lighten'>
            <Image
              src='/images/rental-auth-bg.jpg'
              alt='Background pattern'
              fill
              className='object-cover object-right-top'
              priority={false}
              sizes='20rem'
            />
          </div>
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
