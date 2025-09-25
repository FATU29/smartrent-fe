import React, { useEffect, useMemo, useState } from 'react'
import Navigation from '@/components/organisms/navigation'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import LanguageSwitch from '@/components/molecules/languageSwitch'
import ThemeSwitch from '@/components/molecules/themeSwitch'
import UserMenu from '@/components/molecules/userMenu'
import { NavigationItemData } from '@/components/atoms/navigation-item'
import { getNavigationItems } from '@/components/organisms/navigation/navigationItems.helper'
import { Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { useAuthDialog } from '@/contexts/authDialog'
import { useRouter } from 'next/router'
//

export interface AppHeaderProps {
  activeItem?: string
  onItemClick?: (item: NavigationItemData) => void
  logo?: React.ReactNode
  rightContent?: React.ReactNode
}

const DefaultLogo: React.FC = () => (
  <div className='flex items-center gap-2'>
    <div className='w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center'>
      <Building2 className='h-3 w-3 sm:h-5 sm:w-5 text-primary-foreground' />
    </div>
    <Typography variant='h5' className='text-foreground text-sm sm:text-base'>
      SmartRent
    </Typography>
  </div>
)

const AppHeader: React.FC<AppHeaderProps> = ({
  activeItem = 'home',

  onItemClick,
  logo,
  rightContent,
}) => {
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState(activeItem)
  const t = useTranslations()
  const { isAuthenticated } = useAuth()
  const { openAuth } = useAuthDialog()
  const router = useRouter()

  useEffect(() => setMounted(true), [])
  useEffect(() => setActive(activeItem), [activeItem])

  const items = useMemo(() => getNavigationItems(active, t), [active, t])

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
      {isAuthenticated ? (
        <UserMenu />
      ) : (
        <Button
          onClick={() => openAuth('login')}
          size='sm'
          className='text-xs sm:text-sm'
        >
          {t('homePage.auth.login.loginButton')}
        </Button>
      )}
    </div>
  )

  if (!mounted) return null

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
