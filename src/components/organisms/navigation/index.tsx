import React from 'react'
import { cn } from '@/lib/utils'
import MobileNavigationDrawer from '@/components/molecules/mobile-navigation-drawer'
import DesktopNavigation from '@/components/molecules/desktopNavigation'
import { NavigationItemData } from '@/components/atoms/navigation-item'

interface NavigationProps {
  items: NavigationItemData[]
  className?: string
  onItemClick?: (item: NavigationItemData) => void
  logo?: React.ReactNode
  rightContent?: React.ReactNode
}

const Navigation: React.FC<NavigationProps> = ({
  items,
  className,
  onItemClick,
  logo,
  rightContent,
}) => {
  const handleItemClick = (item: NavigationItemData) => {
    if (onItemClick) {
      onItemClick(item)
    }
  }

  return (
    <header
      className={cn(
        'w-full border-b border-border bg-background sticky top-0 z-50',
        className,
      )}
    >
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-12 sm:h-16 items-center justify-between'>
          {logo && (
            <div className='flex items-center flex-shrink-0'>{logo}</div>
          )}

          <div className='hidden lg:block flex-1 ml-3 sm:ml-4 md:ml-6'>
            <DesktopNavigation items={items} onItemClick={handleItemClick} />
          </div>

          <div className='flex items-center gap-2 sm:gap-4'>
            <div className='hidden sm:flex items-center gap-2 sm:gap-3'>
              {rightContent}
            </div>

            <div className='lg:hidden'>
              <MobileNavigationDrawer
                items={items}
                onItemClick={handleItemClick}
                rightContent={rightContent}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navigation
