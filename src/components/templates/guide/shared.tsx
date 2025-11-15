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
    <Card className={`p-6 ${className}`.trim()}>
      <div className='flex items-start gap-3 mb-4'>
        {icon && (
          <div className={`p-2 rounded-lg ${headerBgClass}`.trim()}>
            <div className={`h-6 w-6 ${iconClassName}`}>{icon}</div>
          </div>
        )}
        <div>
          <Typography variant='h3' className='mb-2'>
            {title}
          </Typography>
          {description && (
            <Typography variant='p' className='text-muted-foreground'>
              {description}
            </Typography>
          )}
        </div>
      </div>
      {children}
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
    className={`space-y-${tight ? 1 : 2} text-muted-foreground ${className}`.trim()}
  >
    {items.map((content, i) => (
      <li key={i} className='flex items-start gap-2'>
        <span className={`${markerClassName} mt-1`}>•</span>
        <span>{content}</span>
      </li>
    ))}
  </ul>
)

interface CheckListProps {
  items: React.ReactNode[]
  marker?: React.ReactNode
  markerClassName?: string
  className?: string
}

export const CheckList: React.FC<CheckListProps> = ({
  items,
  marker = '✓',
  markerClassName = 'text-green-600 dark:text-green-400',
  className = '',
}) => (
  <ul className={`space-y-3 ${className}`.trim()}>
    {items.map((content, i) => (
      <li key={i} className='flex items-start gap-2'>
        <span className={`${markerClassName} mt-1`}>{marker}</span>
        <Typography variant='p' className='text-green-900 dark:text-green-100'>
          {content}
        </Typography>
      </li>
    ))}
  </ul>
)

interface NumberedStepListProps {
  steps: { title: React.ReactNode; description?: React.ReactNode }[]
  start?: number
  className?: string
}

export const NumberedStepList: React.FC<NumberedStepListProps> = ({
  steps,
  start = 1,
  className = '',
}) => (
  <div className={`space-y-6 ${className}`.trim()}>
    {steps.map((s, i) => (
      <div key={i}>
        <Typography variant='h4' className='mb-3 flex items-center gap-2'>
          <span className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold'>
            {start + i}
          </span>
          {s.title}
        </Typography>
        {s.description && (
          <Typography variant='p' className='ml-8 text-muted-foreground'>
            {s.description}
          </Typography>
        )}
      </div>
    ))}
  </div>
)

/** Simple helper layout for indented content within a GuideCard */
export const Indented: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = '' }) => (
  <div className={`ml-11 ${className}`.trim()}>{children}</div>
)
