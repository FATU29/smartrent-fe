import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { Card, CardContent } from '@/components/atoms/card'
import { Separator } from '@/components/atoms/separator'
import { Newspaper, SearchX, RotateCcw, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsEmptyStateProps {
  className?: string
  /** Whether filters/search are currently active */
  hasActiveFilters?: boolean
  /** Callback to reset all filters */
  onResetFilters?: () => void
}

// ─── Sub-components ──────────────────────────────────────

/** Animated icon with contextual visual */
const EmptyStateIcon: React.FC<{ hasFilters: boolean }> = ({ hasFilters }) => {
  const Icon = hasFilters ? SearchX : Newspaper
  return (
    <div className='relative'>
      <div className='w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center ring-4 ring-muted/30'>
        <Icon className='w-9 h-9 text-muted-foreground/70' strokeWidth={1.5} />
      </div>
      {/* Decorative dots */}
      <span className='absolute -top-1 -right-1 w-3 h-3 rounded-full bg-muted-foreground/15' />
      <span className='absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-muted-foreground/10' />
    </div>
  )
}

/** Heading + description text */
const EmptyStateMessage: React.FC<{
  title: string
  description: string
}> = ({ title, description }) => (
  <div className='space-y-2 text-center'>
    <Typography variant='h3' className='text-lg font-semibold'>
      {title}
    </Typography>
    <Typography
      variant='p'
      className='text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed'
    >
      {description}
    </Typography>
  </div>
)

/** Search tips section (only when filters are active) */
const EmptyStateTips: React.FC = () => {
  const t = useTranslations('newsPage.emptyState')
  const tips = [t('tip1'), t('tip2'), t('tip3')]

  return (
    <div className='w-full max-w-sm'>
      <div className='flex items-center gap-2 mb-3'>
        <Lightbulb className='w-4 h-4 text-amber-500' />
        <Typography variant='small' className='font-medium text-foreground'>
          {t('tips')}
        </Typography>
      </div>
      <ul className='space-y-2'>
        {tips.map((tip, i) => (
          <li
            key={i}
            className='flex items-start gap-2 text-sm text-muted-foreground'
          >
            <span className='mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0' />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Action buttons */
const EmptyStateActions: React.FC<{
  hasFilters: boolean
  onReset?: () => void
}> = ({ hasFilters, onReset }) => {
  const t = useTranslations('newsPage.emptyState')

  if (!hasFilters) return null

  return (
    <div className='flex flex-col sm:flex-row gap-3'>
      <Button variant='default' size='default' onClick={onReset}>
        <RotateCcw className='w-4 h-4' />
        {t('resetFilters')}
      </Button>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────

const NewsEmptyState: React.FC<NewsEmptyStateProps> = ({
  className,
  hasActiveFilters = false,
  onResetFilters,
}) => {
  const t = useTranslations('newsPage.emptyState')

  const title = hasActiveFilters ? t('searchTitle') : t('title')
  const description = hasActiveFilters
    ? t('searchDescription')
    : t('description')

  return (
    <Card className={cn('border-dashed bg-muted/20', className)}>
      <CardContent className='flex flex-col items-center justify-center py-12 px-6 gap-6'>
        {/* Icon */}
        <EmptyStateIcon hasFilters={hasActiveFilters} />

        {/* Message */}
        <EmptyStateMessage title={title} description={description} />

        {/* Action buttons */}
        <EmptyStateActions
          hasFilters={hasActiveFilters}
          onReset={onResetFilters}
        />

        {/* Tips (only when searching) */}
        {hasActiveFilters && (
          <>
            <Separator className='max-w-xs' />
            <EmptyStateTips />
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default NewsEmptyState
