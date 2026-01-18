import { SELLER_ROUTES } from '@/constants'
import React, { useState, useEffect } from 'react'
import {
  X,
  Menu,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Settings,
  MapIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { Avatar } from '@/components/atoms/avatar'
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
import { PUBLIC_ROUTES } from '@/constants/route'

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

  const getUserRole = () => {
    // For now, return 'user' role. In real app, this would come from user data
    return 'user'
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
          <Typography variant='h6' className='text-lg font-semibold'>
            SmartRent
          </Typography>
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

        {/* User Section */}
        <div className='p-4 border-b border-border bg-background'>
          <Typography
            variant='small'
            className='text-sm font-medium text-muted-foreground mb-3'
          >
            {t('navigation.account')}
          </Typography>

          {isAuthenticated && user ? (
            <div className='space-y-3'>
              {/* User Info */}
              <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
                <Avatar className='h-10 w-10'>
                  <div className='flex items-center justify-center h-full w-full bg-primary text-primary-foreground text-sm font-medium'>
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <Typography
                    variant='p'
                    className='text-sm font-medium text-foreground truncate'
                  >
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography
                    variant='p'
                    className='text-xs text-muted-foreground truncate'
                  >
                    {user.email}
                  </Typography>
                  <Typography
                    variant='p'
                    className='text-xs text-primary font-medium'
                  >
                    {t(`homePage.auth.user.role.${getUserRole()}`)}
                  </Typography>
                </div>
              </div>

              {/* User Actions */}
              <div className='flex flex-col gap-2'>
                <Link
                  href={PUBLIC_ROUTES.MAPS}
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant='secondary'
                    size='sm'
                    className='w-full justify-start gap-2'
                  >
                    <MapIcon className='h-4 w-4' />
                    {t('navigation.maps')}
                  </Button>
                </Link>
                <Link
                  href={SELLER_ROUTES.CREATE}
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant='default'
                    size='sm'
                    className='w-full justify-start gap-2'
                  >
                    {t('common.createPost')}
                  </Button>
                </Link>
                <Button
                  variant='ghost'
                  size='sm'
                  className='w-full justify-start gap-2 text-left'
                >
                  <User className='h-4 w-4' />
                  {t('homePage.auth.profile')}
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='w-full justify-start gap-2 text-left'
                >
                  <Settings className='h-4 w-4' />
                  {t('homePage.auth.settings')}
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='w-full justify-start gap-2 text-left text-red-600 hover:text-red-700 hover:bg-red-50'
                  onClick={handleLogout}
                >
                  <LogOut className='h-4 w-4' />
                  {t('homePage.auth.logout')}
                </Button>
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-2'>
              <Link href={PUBLIC_ROUTES.MAPS} onClick={() => setIsOpen(false)}>
                <Button
                  variant='secondary'
                  size='sm'
                  className='w-full justify-start gap-2'
                >
                  <MapIcon className='h-4 w-4' />
                  {t('navigation.maps')}
                </Button>
              </Link>
              <Link
                href={SELLER_ROUTES.CREATE}
                onClick={() => setIsOpen(false)}
              >
                <Button
                  variant='default'
                  size='sm'
                  className='w-full justify-start gap-2'
                >
                  {t('common.createPost')}
                </Button>
              </Link>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start gap-2'
                onClick={() => handleAuthClick('login')}
              >
                <LogIn className='h-4 w-4' />
                {t('navigation.login')}
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start gap-2'
                onClick={() => handleAuthClick('register')}
              >
                <UserPlus className='h-4 w-4' />
                {t('navigation.register')}
              </Button>
            </div>
          )}
        </div>

        <div className='flex flex-col h-full'>
          <div className='flex-1'>
            <div className='p-4 border-b border-border'>
              <Typography
                variant='small'
                className='text-sm font-medium text-muted-foreground mb-3'
              >
                {t('homePage.settings.title')}
              </Typography>
              <div className='flex flex-col gap-3'>
                <div className='flex items-center justify-between'>
                  <Typography
                    variant='small'
                    className='text-sm text-foreground'
                  >
                    {t('homePage.settings.language.title')}
                  </Typography>
                  <LanguageSwitch />
                </div>
                <div className='flex items-center justify-between'>
                  <Typography
                    variant='small'
                    className='text-sm text-foreground'
                  >
                    {t('homePage.settings.theme.title')}
                  </Typography>
                  <ThemeSwitch />
                </div>
              </div>
            </div>

            <div className='p-4'>
              <NavigationMenu
                items={items}
                onItemClick={handleItemClick}
                defaultExpanded={[]}
                isMobile={true}
                className='space-y-1'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Auth dialog handled globally by AuthDialogProvider */}
    </>
  )
}

export default MobileNavigationDrawer
