import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'
import { Button } from '@/components/atoms/button'
import { useAuth, useLogout } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { SELLER_ROUTES } from '@/constants/route'
import BrokerAvatar from '@/components/molecules/brokerAvatar'
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
  const isProfessionalBroker =
    Boolean(user.isBroker) || user.brokerVerificationStatus === 'APPROVED'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
          <BrokerAvatar
            avatarUrl={user.avatarUrl}
            firstName={user.firstName}
            lastName={user.lastName}
            sizeClassName='h-9 w-9'
            showBrokerBadge={isProfessionalBroker}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='p-0 overflow-hidden rounded-xl overflow-x-hidden w-auto min-w-[16rem] max-w-[20rem]'
      >
        <div className='p-5 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden'>
          <div className='absolute inset-0'>
            <Image
              src='/images/banner-default.jpg'
              alt='Background pattern'
              fill
              className='object-cover object-right-top saturate-0 opacity-30'
              priority={false}
              sizes='20rem'
            />
          </div>
          <div className='absolute inset-0 bg-foreground/10' />
          <div className='relative'>
            <h3 className='text-base font-semibold mb-1'>
              {t('userMenu.membershipPackage')}
            </h3>
            <p className='text-xs leading-snug opacity-90 mb-3 max-w-[200px]'>
              {t('userMenu.membershipBenefit')}
            </p>
            <Button
              size='sm'
              className='bg-primary text-primary-foreground hover:bg-primary/90'
              asChild
            >
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
