import { SELLER_ROUTES } from '@/constants'
import React, { useEffect, useMemo, useState } from 'react'
import Navigation from '@/components/organisms/navigation'
import { Button } from '@/components/atoms/button'
import LanguageSwitch from '@/components/molecules/languageSwitch'
import ThemeSwitch from '@/components/molecules/themeSwitch'
import UserDropdown from '@/components/molecules/userDropdown'
import { NavigationItemData } from '@/components/atoms/navigation-item'
import { getNavigationItems } from '@/components/organisms/navigation/navigationItems.helper'
import Logo from '@/components/atoms/logo'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { useAuthDialog } from '@/contexts/authDialog'
import { useRouter } from 'next/router'
import { useCategories } from '@/hooks/useCategories'
import { MapIcon } from 'lucide-react'
import Link from 'next/link'
import { PUBLIC_ROUTES } from '@/constants/route'

export interface AppHeaderProps {
  activeItem?: string
  onItemClick?: (item: NavigationItemData) => void
  logo?: React.ReactNode
  rightContent?: React.ReactNode
}

const DefaultLogo: React.FC = () => <Logo size='medium' />

const AppHeader: React.FC<AppHeaderProps> = ({
  activeItem = 'home',
  onItemClick,
  logo,
  rightContent,
}) => {
  const [active, setActive] = useState(activeItem)
  const t = useTranslations()
  const tCommon = useTranslations('common')
  const { isAuthenticated } = useAuth()
  const { openAuth } = useAuthDialog()
  const router = useRouter()
  const { data: categoriesData } = useCategories()

  useEffect(() => setActive(activeItem), [activeItem])

  const items = useMemo(() => {
    return getNavigationItems(
      active,
      t,
      tCommon,
      categoriesData?.categories ?? [],
    )
  }, [active, t, tCommon, categoriesData?.categories])

  const handleNavClick = (item: NavigationItemData) => {
    setActive(item.id)
    if (onItemClick) {
      onItemClick(item)
      return
    }
    if (item.href) {
      // Prevent default behavior and use client-side navigation
      router.push(item.href, undefined, { scroll: true })
    }
  }

  const defaultRightContent = (
    <div className='flex items-center gap-2 sm:gap-3'>
      <div className='hidden lg:flex items-center gap-2 sm:gap-3'>
        <LanguageSwitch />
        <ThemeSwitch />
      </div>
      <Link href={PUBLIC_ROUTES.MAPS}>
        <Button
          variant='outline'
          size='sm'
          className='hidden lg:flex items-center gap-1 text-xs sm:text-sm'
        >
          <MapIcon className='h-4 w-4' />
          <span className='hidden md:inline'>{t('navigation.maps')}</span>
        </Button>
      </Link>
      <Link href={SELLER_ROUTES.CREATE}>
        <Button
          variant='default'
          size='sm'
          className='hidden lg:block bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-md transition-all duration-300 text-xs sm:text-sm'
        >
          {t('common.createPost')}
        </Button>
      </Link>
      <div className='hidden lg:block'>
        {isAuthenticated ? (
          <UserDropdown />
        ) : (
          <Button
            onClick={() => openAuth('login', router.asPath)}
            size='sm'
            variant='default'
            className='bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-md transition-all duration-300 text-xs sm:text-sm'
          >
            {t('homePage.auth.login.loginButton')}
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <Navigation
      items={items}
      onItemClick={handleNavClick}
      logo={logo ?? <DefaultLogo />}
      rightContent={rightContent ?? defaultRightContent}
    />
  )
}

export default AppHeader
