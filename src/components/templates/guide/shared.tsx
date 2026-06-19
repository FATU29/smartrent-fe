import React from 'react'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'

/**
 * Shared presentation components for guide templates to reduce duplication.
 * These are intentionally lightweight and purely presentational.
 */

export interface GuideCardProps {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Extra className for root Card */
  className?: string
  /** Optional header accent background color class (without opacity modifiers) */
  headerBgClass?: string
  /** Optional icon color class */
  iconClassName?: string
  children?: React.ReactNode
}

export const GuideCard: React.FC<GuideCardProps> = ({
  icon,
  title,
  description,
  className = '',
  headerBgClass = 'bg-primary/10',
  iconClassName = 'text-primary',
  children,
}) => {
  return (
    <Card
      className={`overflow-hidden rounded-2xl border bg-card/90 shadow-sm ${className}`.trim()}
    >
      <div className='flex items-center gap-3 border-b border-border/60 px-5 py-4 sm:px-6 sm:py-5'>
        {icon && (
          <div className={`rounded-lg p-2 ${headerBgClass}`.trim()}>
            <div className={`h-6 w-6 ${iconClassName}`}>{icon}</div>
          </div>
        )}
        <div className='min-w-0'>
          <Typography
            variant='h4'
            className='text-lg leading-snug tracking-tight sm:text-xl'
          >
            {title}
          </Typography>
          {description && (
            <Typography
              variant='p'
              className='mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground'
            >
              {description}
            </Typography>
          )}
        </div>
      </div>
      <div className='px-5 py-4 sm:px-6 sm:py-5'>{children}</div>
    </Card>
  )
}

interface BulletListProps {
  items: React.ReactNode[]
  markerClassName?: string
  className?: string
  tight?: boolean
}

export const BulletList: React.FC<BulletListProps> = ({
  items,
  markerClassName = 'text-primary',
  className = '',
  tight = false,
}) => (
  <ul
    className={`${tight ? 'space-y-1.5' : 'space-y-2'} text-sm leading-6 text-muted-foreground ${className}`.trim()}
  >
    {items.map((content, i) => (
      <li key={i} className='flex items-start gap-1.5'>
        <span className={`${markerClassName} mt-0.5 shrink-0`}>•</span>
        <span className='min-w-0'>{content}</span>
      </li>
    ))}
  </ul>
)

/** Simple helper layout for indented content within a GuideCard */
export const Indented: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = '' }) => (
  <div className={`ml-0 sm:ml-10 ${className}`.trim()}>{children}</div>
)
