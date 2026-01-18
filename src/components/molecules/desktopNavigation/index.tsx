import React, { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { NavigationItemData } from '@/components/atoms/navigation-item'
import { Button } from '@/components/atoms/button'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

interface DesktopNavigationProps {
  items: NavigationItemData[]
  className?: string
  onItemClick?: (item: NavigationItemData) => void
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  items,
  className,
  onItemClick,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Handle mouse enter for parent items
  const handleMouseEnter = useCallback((itemId: string) => {
    setActiveDropdown(itemId)
  }, [])

  // Handle mouse leave for parent items
  const handleMouseLeave = useCallback(() => {
    setActiveDropdown(null)
  }, [])

  // Handle mouse enter for dropdowns
  const handleDropdownMouseEnter = useCallback((itemId: string) => {
    setActiveDropdown(itemId)
  }, [])

  // Handle mouse leave for dropdowns
  const handleDropdownMouseLeave = useCallback(() => {
    setActiveDropdown(null)
  }, [])

  // Handle item click
  const handleItemClick = useCallback(
    (item: NavigationItemData) => {
      if (onItemClick) {
        onItemClick(item)
      }
      setActiveDropdown(null)
    },
    [onItemClick],
  )

  // Render dropdown - simple UI only
  const renderDropdown = useCallback(
    (item: NavigationItemData) => {
      if (!item.children || item.children.length === 0) return null

      const isActive = activeDropdown === item.id

      return (
        <div
          ref={(el) => {
            dropdownRefs.current[item.id] = el
          }}
          className={cn(
            'absolute top-full left-0 min-w-48 bg-popover border border-border rounded-md z-50',
            'navigation-dropdown',
            isActive
              ? 'navigation-dropdown-enter-active'
              : 'navigation-dropdown-enter',
          )}
          onMouseEnter={() => handleDropdownMouseEnter(item.id)}
          onMouseLeave={handleDropdownMouseLeave}
          style={{
            transform: 'translateY(0.5rem)',
          }}
        >
          <div className='p-1'>
            {item.children.map((child) => (
              <div key={child.id} className='relative'>
                {child.href ? (
                  <Link
                    href={child.href}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm rounded-sm transition-colors block',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus:outline-none focus:bg-accent focus:text-accent-foreground',
                      child.isActive && 'bg-accent text-accent-foreground',
                    )}
                    onClick={() => handleItemClick(child)}
                  >
                    <div className='flex items-center justify-between'>
                      <span>{child.label}</span>
                    </div>
                  </Link>
                ) : (
                  <button
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm rounded-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus:outline-none focus:bg-accent focus:text-accent-foreground',
                      child.isActive && 'bg-accent text-accent-foreground',
                    )}
                    onClick={() => handleItemClick(child)}
                  >
                    <div className='flex items-center justify-between'>
                      <span>{child.label}</span>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    },
    [
      activeDropdown,
      handleDropdownMouseEnter,
      handleDropdownMouseLeave,
      handleItemClick,
    ],
  )

  return (
    <nav className={cn('hidden md:flex items-center space-x-1', className)}>
      {items?.map((item) => (
        <div key={item.id} className='relative'>
          {/* Use Link for items without children, Button for items with dropdown */}
          {item.href && (!item.children || item.children.length === 0) ? (
            <Link
              href={item.href}
              className={cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                'disabled:pointer-events-none disabled:opacity-50',
                'hover:bg-accent hover:text-accent-foreground',
                'h-9 px-3 py-2',
                item.isActive && 'bg-accent text-accent-foreground',
              )}
              onClick={() => handleItemClick(item)}
            >
              {item.label}
            </Link>
          ) : (
            <Button
              variant='ghost'
              className={cn(
                'relative px-3 py-2 h-auto font-normal',
                'hover:bg-accent hover:text-accent-foreground',
                item.isActive && 'bg-accent text-accent-foreground',
              )}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => handleMouseEnter(item.id)}
              onMouseLeave={handleMouseLeave}
            >
              {item.label}
              {item.children && item.children.length > 0 && (
                <ChevronDown className='ml-1 h-4 w-4 transition-transform duration-200' />
              )}
            </Button>
          )}

          {/* Dropdown - simple render */}
          {item.children && item.children.length > 0 && renderDropdown(item)}
        </div>
      ))}
    </nav>
  )
}

export default DesktopNavigation
