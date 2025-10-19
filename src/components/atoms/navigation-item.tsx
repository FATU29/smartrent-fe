import React from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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
          'group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full',
          'hover:bg-accent hover:text-accent-foreground',
          item.isActive && 'bg-accent text-accent-foreground',
          level > 0 && 'ml-4',
          level === 1 && 'ml-6',
          level === 2 && 'ml-8',
        )}
      >
        <button
          type='button'
          className='flex items-center gap-2 min-w-0 flex-1 text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm'
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
              'flex-shrink-0 p-1 rounded-sm transition-transform duration-200',
              'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring',
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
        <div className='mt-1 space-y-1'>
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
