import React from 'react'
import { Badge } from '@/components/atoms/badge'
import { Separator } from '@/components/atoms/separator'
import { BarChart3, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardNoDataStateProps {
  title: string
  description: string
  badgeLabel?: string
  hintTitle?: string
  hints?: string[]
  metricChips?: string[]
  className?: string
}

const DashboardNoDataState: React.FC<DashboardNoDataStateProps> = ({
  title,
  description,
  badgeLabel,
  hintTitle,
  hints,
  metricChips,
  className,
}) => {
  const hasHints = Boolean(hintTitle && hints && hints.length > 0)

  const previewBars = [28, 40, 34, 56, 48, 64, 42]

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-xl border border-dashed bg-gradient-to-br from-muted/40 via-background to-muted/10 p-4 sm:p-6',
        className,
      )}
      aria-live='polite'
    >
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -left-10 -top-14 h-36 w-36 rounded-full bg-primary/10 blur-2xl' />
        <div className='absolute -bottom-14 -right-10 h-36 w-36 rounded-full bg-blue-500/10 blur-2xl' />
      </div>

      <div
        className={cn(
          'relative grid gap-5',
          hasHints &&
            'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]',
        )}
      >
        <div className='space-y-5'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10'>
              <BarChart3 className='h-6 w-6 text-primary' />
            </div>

            <div className='space-y-2'>
              {badgeLabel ? (
                <Badge
                  variant='secondary'
                  className='w-fit border-primary/20 bg-primary/10 text-primary'
                >
                  {badgeLabel}
                </Badge>
              ) : null}
              <h3 className='text-base font-semibold sm:text-lg'>{title}</h3>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                {description}
              </p>
            </div>
          </div>

          <Separator className='opacity-70' />

          <div className='rounded-lg border bg-background/75 p-3 sm:p-4'>
            <div className='h-28 sm:h-32'>
              <div className='flex h-full items-end gap-1.5 sm:gap-2'>
                {previewBars.map((height, index) => (
                  <div
                    key={`${height}-${index}`}
                    className='flex-1 rounded-t-md bg-primary/15'
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            {metricChips && metricChips.length > 0 ? (
              <div className='mt-4 flex flex-wrap gap-2'>
                {metricChips.map((chip) => (
                  <Badge key={chip} variant='outline' className='text-xs'>
                    {chip}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {hasHints ? (
          <aside className='rounded-lg border bg-background/80 p-4'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <Sparkles className='h-4 w-4 text-amber-500' />
              {hintTitle}
            </div>
            <ul className='mt-3 space-y-2'>
              {hints?.map((hint, index) => (
                <li
                  key={`${hint}-${index}`}
                  className='flex items-start gap-2 text-sm text-muted-foreground'
                >
                  <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60' />
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </section>
  )
}

export default DashboardNoDataState
