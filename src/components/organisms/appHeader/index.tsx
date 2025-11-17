import React, { useEffect, useMemo, useState } from 'react'
import Navigation from '@/components/organisms/navigation'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import LanguageSwitch from '@/components/molecules/languageSwitch'
import ThemeSwitch from '@/components/molecules/themeSwitch'
import UserDropdown from '@/components/molecules/userDropdown'
import { NavigationItemData } from '@/components/atoms/navigation-item'
import { getNavigationItems } from '@/components/organisms/navigation/navigationItems.helper'
import { Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { useAuthDialog } from '@/contexts/authDialog'
import { useRouter } from 'next/router'
import Link from 'next/link'

export interface AppHeaderProps {
  activeItem?: string
  onItemClick?: (item: NavigationItemData) => void
  logo?: React.ReactNode
  rightContent?: React.ReactNode
}

const DefaultLogo: React.FC = () => (
  <Link
    href='/'
    className='flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md'
    aria-label='Go to homepage'
  >
    <div className='w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center group-hover:opacity-90 transition-opacity'>
      <Building2 className='h-3 w-3 sm:h-5 sm:w-5 text-primary-foreground' />
    </div>
    <Typography
      variant='h5'
      className='text-foreground text-sm sm:text-base font-semibold'
    >
      SmartRent
    </Typography>
  </Link>
)

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

  useEffect(() => setActive(activeItem), [activeItem])

  const items = useMemo(
    () => getNavigationItems(active, t, tCommon),
    [active, t, tCommon],
  )

  const handleNavClick = (item: NavigationItemData) => {
    setActive(item.id)
    if (onItemClick) {
      onItemClick(item)
      return
    }
    if (item.href) router.push(item.href)
  }

  const defaultRightContent = (
    <div className='flex items-center gap-2 sm:gap-3'>
      <LanguageSwitch />
      <ThemeSwitch />
      <Button
        onClick={() => router.push('/seller/create-post')}
        variant='default'
        size='sm'
        className='bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-md transition-all duration-300 text-xs sm:text-sm'
      >
        {t('common.createPost')}
      </Button>
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
