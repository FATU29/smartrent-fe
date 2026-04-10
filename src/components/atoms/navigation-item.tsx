import React from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAVIGATION_TEXT_CLASSNAME } from '@/components/organisms/navigation/navigationTypography'

export interface NavigationItemData {
  id: string
  label: string
  href?: string
  icon?: React.ReactNode
  children?: NavigationItemData[]
  isActive?: boolean
  isExpanded?: boolean
}

interface NavigationItemProps {
  item: NavigationItemData
  level?: number
  onItemClick?: (item: NavigationItemData) => void
  onToggleExpand?: (itemId: string) => void
  className?: string
  isMobile?: boolean
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  level = 0,
  onItemClick,
  onToggleExpand,
  className,
  isMobile = false,
}) => {
  const hasChildren = item.children && item.children.length > 0
  const isExpandable = hasChildren && level < 3 // Limit nesting to 3 levels

  const handleClick = () => {
    if (onItemClick) {
      onItemClick(item)
    }

    // On mobile, always toggle expand for parent items
    if (isMobile && isExpandable && onToggleExpand) {
      onToggleExpand(item.id)
    }
    // On desktop, only toggle if explicitly clicked on toggle button
    else if (!isMobile && isExpandable && onToggleExpand) {
      // Don't auto-toggle on desktop
    }
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleExpand) {
      onToggleExpand(item.id)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'group flex items-center justify-between transition-all duration-200 w-full',
          isMobile
            ? level === 0
              ? 'min-h-14 rounded-xl border border-border/50 bg-muted/40 px-4 py-3 hover:bg-accent/60'
              : 'min-h-12 rounded-none border-0 bg-transparent px-4 py-3 shadow-none hover:bg-accent/30'
            : 'rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground',
          NAVIGATION_TEXT_CLASSNAME,
          item.isActive && 'bg-accent text-accent-foreground',
          isMobile &&
            level === 0 &&
            item.isExpanded &&
            'bg-accent text-accent-foreground',
          !isMobile && level > 0 && 'ml-4',
          !isMobile && level === 1 && 'ml-6',
          !isMobile && level === 2 && 'ml-8',
          isMobile && level > 0 && 'pl-12',
          isMobile && level === 2 && 'pl-16',
        )}
      >
        <button
          type='button'
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm',
            isMobile && 'text-base font-medium',
          )}
          onClick={handleClick}
        >
          {item.icon && (
            <span className='flex-shrink-0 text-muted-foreground group-hover:text-accent-foreground'>
              {item.icon}
            </span>
          )}
          <span className='truncate'>{item.label}</span>
        </button>

        {isExpandable && (
          <button
            type='button'
            onClick={handleToggle}
            className={cn(
              'flex-shrink-0 rounded-sm transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-ring',
              isMobile ? 'p-2 hover:bg-accent/50' : 'p-1 hover:bg-accent/50',
            )}
            aria-label={item.isExpanded ? 'Collapse' : 'Expand'}
          >
            {item.isExpanded ? (
              <ChevronDown className='h-4 w-4' />
            ) : (
              <ChevronRight className='h-4 w-4' />
            )}
          </button>
        )}
      </div>

      {hasChildren && item.isExpanded && item.children && (
        <div
          className={cn(
            'mt-1',
            isMobile
              ? 'relative space-y-2 pl-2 before:absolute before:bottom-2 before:left-3 before:top-2 before:w-px before:bg-border'
              : 'space-y-1',
          )}
        >
          {item.children.map((child) => (
            <NavigationItem
              key={child.id}
              item={child}
              level={level + 1}
              onItemClick={onItemClick}
              onToggleExpand={onToggleExpand}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default NavigationItem
