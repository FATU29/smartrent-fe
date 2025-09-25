import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type IconType = React.ComponentType<{ className?: string }>

type MobileNavItemProps = {
  label: string
  icon: IconType
  href?: string
  onClick?: () => void
  active?: boolean
  ariaLabel?: string
  tone?: 'default' | 'muted'
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({
  label,
  icon: Icon,
  href,
  onClick,
  active = false,
  ariaLabel,
  tone = 'default',
}) => {
  const contentClasses = cn(
    'flex flex-col items-stretch gap-1 px-2 py-1',
    href
      ? active
        ? 'text-foreground'
        : 'text-muted-foreground'
      : tone === 'muted'
        ? 'text-muted-foreground'
        : 'text-foreground',
  )

  return (
    <li className='flex flex-col items-stretch text-xs'>
      {href ? (
        <Link
          href={href}
          className={contentClasses}
          aria-current={active ? 'page' : undefined}
        >
          <Icon className='h-6 w-6 mx-auto' />
          <span className='block w-full text-center leading-tight whitespace-nowrap truncate'>
            {label}
          </span>
        </Link>
      ) : (
        <button
          type='button'
          className={contentClasses}
          onClick={onClick}
          aria-label={ariaLabel}
        >
          <Icon className='h-6 w-6 mx-auto' />
          <span className='block w-full text-center leading-tight whitespace-nowrap truncate'>
            {label}
          </span>
        </button>
      )}
    </li>
  )
}

export default MobileNavItem
