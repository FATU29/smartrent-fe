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
      <div className='flex items-start gap-3 border-b border-border/60 px-5 py-4 sm:px-6 sm:py-5'>
        {icon && (
          <div className={`rounded-lg p-2 ${headerBgClass}`.trim()}>
            <div className={`h-6 w-6 ${iconClassName}`}>{icon}</div>
          </div>
        )}
        <div className='min-w-0'>
          <Typography
            variant='h4'
            className='text-base leading-snug tracking-tight sm:text-lg'
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
  <ul className={`space-y-2 ${className}`.trim()}>
    {items.map((content, i) => (
      <li key={i} className='flex items-start gap-1.5'>
        <span className={`${markerClassName} mt-0.5 shrink-0`}>{marker}</span>
        <Typography
          variant='p'
          className='min-w-0 text-sm leading-6 text-green-900 dark:text-green-100'
        >
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

const STEP_NUMBER_PREFIX_REGEX = /^\s*\d+\s*(?:[.)-]\s*)?/

const normalizeStepTitle = (title: React.ReactNode) => {
  if (typeof title !== 'string') return title
  return title.replace(STEP_NUMBER_PREFIX_REGEX, '').trim()
}

export const NumberedStepList: React.FC<NumberedStepListProps> = ({
  steps,
  start = 1,
  className = '',
}) => (
  <div className={`space-y-5 ${className}`.trim()}>
    {steps.map((s, i) => (
      <div key={i}>
        <Typography
          variant='h4'
          className='flex items-start gap-2.5 text-base leading-snug tracking-tight sm:text-lg'
        >
          <span className='mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground sm:text-sm'>
            {start + i}
          </span>
          {normalizeStepTitle(s.title)}
        </Typography>
        {s.description && (
          <Typography
            variant='p'
            className='ml-9 mt-1.5 text-sm leading-6 text-muted-foreground'
          >
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
  <div className={`ml-0 sm:ml-10 ${className}`.trim()}>{children}</div>
)
