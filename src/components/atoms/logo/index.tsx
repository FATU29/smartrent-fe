import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Building2 } from 'lucide-react'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'

export interface LogoProps {
  /**
   * The size variant of the logo
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large'
  /**
   * Whether to show the text alongside the logo
   * @default true
   */
  showText?: boolean
  /**
   * Whether the logo should be clickable and navigate to home
   * @default true
   */
  clickable?: boolean
  /**
   * Custom className for additional styling
   */
  className?: string
  /**
   * Use image logo instead of icon
   * @default false
   */
  useImage?: boolean
  /**
   * Custom image path (only applies when useImage is true)
   */
  imagePath?: string
  /**
   * Aria label for accessibility
   */
  ariaLabel?: string
}

const sizeConfig = {
  small: {
    container: 'gap-1.5',
    icon: 'w-5 h-5 sm:w-6 sm:h-6',
    iconInner: 'h-3 w-3 sm:h-3.5 sm:w-3.5',
    image: 'w-8 h-8 sm:w-10 sm:h-10',
    text: 'text-xs sm:text-sm',
  },
  medium: {
    container: 'gap-2',
    icon: 'w-6 h-6 sm:w-8 sm:h-8',
    iconInner: 'h-3 w-3 sm:h-5 sm:w-5',
    image: 'w-10 h-10 sm:w-12 sm:h-12',
    text: 'text-sm sm:text-base',
  },
  large: {
    container: 'gap-3',
    icon: 'w-10 h-10 sm:w-12 sm:h-12',
    iconInner: 'h-6 w-6 sm:h-7 sm:w-7',
    image: 'w-14 h-14 sm:w-16 sm:h-16',
    text: 'text-lg sm:text-xl',
  },
}

export const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  showText = true,
  clickable = true,
  className,
  useImage = true,
  imagePath = '/images/logo-smartrent.jpg',
  ariaLabel = 'SmartRent - Go to homepage',
}) => {
  const config = sizeConfig[size]

  const logoContent = (
    <>
      {useImage ? (
        <div
          className={cn('relative rounded-lg overflow-hidden', config.image)}
        >
          <Image
            src={imagePath}
            alt='SmartRent Logo'
            fill
            className='object-cover'
            sizes='(max-width: 640px) 40px, (max-width: 768px) 48px, 64px'
            priority
          />
        </div>
      ) : (
        <div
          className={cn(
            'bg-primary rounded-lg flex items-center justify-center group-hover:opacity-90 transition-opacity',
            config.icon,
          )}
        >
          <Building2
            className={cn('text-primary-foreground', config.iconInner)}
          />
        </div>
      )}
      {showText && (
        <Typography
          variant='h5'
          className={cn('text-foreground font-semibold', config.text)}
        >
          SmartRent
        </Typography>
      )}
    </>
  )

  if (!clickable) {
    return (
      <div className={cn('flex items-center', config.container, className)}>
        {logoContent}
      </div>
    )
  }

  return (
    <Link
      href='/'
      className={cn(
        'flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md',
        config.container,
        className,
      )}
      aria-label={ariaLabel}
    >
      {logoContent}
    </Link>
  )
}

export default Logo
