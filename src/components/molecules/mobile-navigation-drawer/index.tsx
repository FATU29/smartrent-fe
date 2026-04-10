import { SELLER_ROUTES } from '@/constants'
import React, { useMemo, useState, useEffect } from 'react'
import {
  X,
  Menu,
  LogOut,
  User,
  ShieldCheck,
  MapIcon,
  Languages,
  Palette,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import Logo from '@/components/atoms/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import Link from 'next/link'
import NavigationMenu from '@/components/molecules/navigation-menu'
import { NavigationItemData } from '@/components/atoms/navigation-item'
import LanguageSwitch from '@/components/molecules/languageSwitch'
import ThemeSwitch from '@/components/molecules/themeSwitch'
import type { AuthType } from '@/components/organisms/authDialog'
import { useTranslations } from 'next-intl'
import { useAuth, useLogout } from '@/hooks/useAuth'
import { useAuthDialog } from '@/contexts/authDialog'
import { useRouter } from 'next/router'
import { PUBLIC_ROUTES, SELLERNET_ROUTES } from '@/constants/route'

interface MobileNavigationDrawerProps {
  items: NavigationItemData[]
  className?: string
  onItemClick?: (item: NavigationItemData) => void
  rightContent?: React.ReactNode
}

const MobileNavigationDrawer: React.FC<MobileNavigationDrawerProps> = ({
  items,
  className,
  onItemClick,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const { openAuth } = useAuthDialog()
  const router = useRouter()
  const t = useTranslations()
  const { user, isAuthenticated } = useAuth()
  const { logoutUser } = useLogout()

  const mobileMenuItems = useMemo(() => {
    const isMapsItem = (item: NavigationItemData) =>
      item.id === 'maps' || item.href === PUBLIC_ROUTES.MAPS

    const existingMapsItem = items.find(isMapsItem)
    const nonMapsItems = items.filter((item) => !isMapsItem(item))
    const mapsItemWithIcon = existingMapsItem
      ? {
          ...existingMapsItem,
          icon: existingMapsItem.icon ?? <MapIcon className='h-4 w-4' />,
        }
      : {
          id: 'maps',
          label: t('navigation.maps'),
          href: PUBLIC_ROUTES.MAPS,
          icon: <MapIcon className='h-4 w-4' />,
        }

    return [...nonMapsItems, mapsItemWithIcon]
  }, [items, t])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleItemClick = (item: NavigationItemData) => {
    if (onItemClick) {
      onItemClick(item)
    }

    if (!item.children || item.children.length === 0) {
      setIsOpen(false)
    }
  }

  const handleAuthClick = (type: AuthType) => {
    openAuth(type, router.asPath)
    setIsOpen(false)
  }

  const handleLogout = async () => {
    await logoutUser()
    setIsOpen(false)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        className={cn(
          'p-2 hover:bg-accent hover:text-accent-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          className,
        )}
        onClick={() => setIsOpen(true)}
        aria-label='Open navigation menu'
      >
        <Menu className='h-4 w-4 sm:h-5 sm:w-5' />
      </Button>

      {isOpen && (
        <div
          className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm'
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full bg-background border-l border-border overflow-y-auto',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className='flex items-center justify-between p-4 border-b border-border'>
          <Logo size='medium' />
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              className='p-2 hover:bg-accent hover:text-accent-foreground'
              onClick={() => setIsOpen(false)}
              aria-label='Close navigation menu'
            >
              <X className='h-4 w-4 sm:h-5 sm:w-5' />
            </Button>
          </div>
        </div>

        {/* User Section */}
        <div className='p-4 border-b border-border bg-background'>
          {isAuthenticated && user ? (
            <div className='space-y-3'>
              <div className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
                <div className='bg-muted/40 p-4'>
                  <div className='flex items-start gap-3'>
                    <Avatar className='h-12 w-12 ring-2 ring-border'>
                      <AvatarImage
                        src={user.avatarUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className='object-cover'
                      />
                      <AvatarFallback className='bg-primary text-primary-foreground text-sm font-semibold'>
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className='min-w-0 flex-1'>
                      <Typography
                        variant='p'
                        className='truncate text-base font-semibold text-foreground'
                      >
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography
                        variant='p'
                        className='truncate text-xs text-muted-foreground'
                      >
                        {user.email}
                      </Typography>
                    </div>

                    <span className='rounded-full bg-accent px-2 py-1 text-[11px] font-medium text-accent-foreground'>
                      {t('navigation.account')}
                    </span>
                  </div>

                  <div className='mt-3 grid grid-cols-2 gap-2'>
                    <Button
                      asChild
                      variant='secondary'
                      className='h-10 justify-start rounded-lg px-3'
                    >
                      <Link
                        href={SELLERNET_ROUTES.PERSONAL_EDIT}
                        onClick={() => setIsOpen(false)}
                      >
                        <User className='h-4 w-4' />
                        {t('homePage.auth.profile')}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant='secondary'
                      className='h-10 justify-start rounded-lg px-3'
                    >
                      <Link
                        href={SELLER_ROUTES.MEMBERSHIP}
                        onClick={() => setIsOpen(false)}
                      >
                        <ShieldCheck className='h-4 w-4' />
                        {t('navigation.seller.membership')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className='rounded-2xl border border-border bg-card p-2 shadow-sm'>
                <Button
                  asChild
                  variant='default'
                  className='h-12 w-full justify-start rounded-xl px-4 text-sm font-semibold shadow-sm'
                >
                  <Link
                    href={SELLER_ROUTES.CREATE}
                    onClick={() => setIsOpen(false)}
                  >
                    {t('common.createPost')}
                  </Link>
                </Button>

                <div className='my-2 border-t border-border/70' />

                <Button
                  variant='ghost'
                  className='h-11 w-full justify-start gap-2 rounded-xl px-3 text-left text-destructive hover:bg-destructive/10 hover:text-destructive'
                  onClick={handleLogout}
                >
                  <LogOut className='h-4 w-4' />
                  {t('homePage.auth.logout')}
                </Button>
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <Button
                  variant='outline'
                  className='h-14 rounded-2xl border-border bg-background text-base font-semibold shadow-none hover:bg-muted/50'
                  onClick={() => handleAuthClick('login')}
                >
                  {t('navigation.login')}
                </Button>
                <Button
                  variant='default'
                  className='h-14 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90'
                  onClick={() => handleAuthClick('register')}
                >
                  {t('navigation.register')}
                </Button>
              </div>

              <Button
                asChild
                variant='outline'
                className='h-14 w-full rounded-2xl border-border bg-background text-base font-semibold shadow-none hover:bg-muted/50'
              >
                <Link
                  href={SELLER_ROUTES.CREATE}
                  onClick={() => setIsOpen(false)}
                >
                  {t('common.createPost')}
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className='flex flex-col h-full'>
          <div className='flex-1'>
            <div className='p-4'>
              <NavigationMenu
                items={mobileMenuItems}
                onItemClick={handleItemClick}
                defaultExpanded={[]}
                isMobile={true}
                className='space-y-2'
              />
            </div>

            <div className='p-4 border-t border-border'>
              <div className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
                <Typography
                  variant='small'
                  className='mb-3 text-sm font-semibold text-foreground'
                >
                  {t('homePage.settings.title')}
                </Typography>

                <div className='space-y-3'>
                  <div className='flex min-h-12 items-center justify-between rounded-xl border border-border bg-muted/40 px-3'>
                    <div className='flex items-center gap-2'>
                      <Languages className='h-4 w-4 text-muted-foreground' />
                      <Typography
                        variant='small'
                        className='text-sm font-medium text-foreground'
                      >
                        {t('homePage.settings.language.title')}
                      </Typography>
                    </div>
                    <LanguageSwitch />
                  </div>

                  <div className='flex min-h-12 items-center justify-between rounded-xl border border-border bg-muted/40 px-3'>
                    <div className='flex items-center gap-2'>
                      <Palette className='h-4 w-4 text-muted-foreground' />
                      <Typography
                        variant='small'
                        className='text-sm font-medium text-foreground'
                      >
                        {t('homePage.settings.theme.title')}
                      </Typography>
                    </div>
                    <ThemeSwitch />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth dialog handled globally by AuthDialogProvider */}
    </>
  )
}

export default MobileNavigationDrawer
