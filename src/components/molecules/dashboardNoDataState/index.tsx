import React from 'react'
import { Badge } from '@/components/atoms/badge'
import { Separator } from '@/components/atoms/separator'
import { BarChart3, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardNoDataStateProps {
  title: string
  description: string
  hintTitle?: string
  hints?: string[]
  metricChips?: string[]
  className?: string
}

const DashboardNoDataState: React.FC<DashboardNoDataStateProps> = ({
  title,
  description,
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
        'relative overflow-hidden rounded-2xl border border-dashed border-primary/25 bg-gradient-to-br from-background via-muted/35 to-background p-5 shadow-[inset_0_1px_0_hsl(var(--background)),0_16px_40px_-28px_hsl(var(--foreground)/0.45)] sm:p-7',
        className,
      )}
      aria-live='polite'
    >
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -left-10 -top-14 h-40 w-40 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute -bottom-14 -right-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl' />
      </div>

      <div
        className={cn(
          'relative grid gap-6 lg:gap-7',
          hasHints &&
            'grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(240px,300px)]',
        )}
      >
        <div className='space-y-5'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-inner'>
              <BarChart3 className='h-6 w-6 text-primary' />
            </div>

            <div className='space-y-2.5'>
              <Badge
                variant='secondary'
                className='w-fit rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary'
              >
                {title}
              </Badge>
              <p className='max-w-2xl text-sm leading-6 text-muted-foreground sm:text-md'>
                {description}
              </p>
            </div>
          </div>

          <Separator className='opacity-60' />

          <div className='rounded-xl border border-border/70 bg-background/85 p-4 sm:p-5'>
            <div className='h-28 sm:h-32'>
              <div className='flex h-full items-end gap-1.5 sm:gap-2'>
                {previewBars.map((height, index) => (
                  <div
                    key={`${height}-${index}`}
                    className='flex-1 rounded-t-lg bg-gradient-to-t from-primary/15 to-primary/30'
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            {metricChips && metricChips.length > 0 ? (
              <div className='mt-5 flex flex-wrap gap-2'>
                {metricChips.map((chip) => (
                  <Badge
                    key={chip}
                    variant='outline'
                    className='rounded-full border-border/70 bg-background/70 px-2.5 py-1 text-2xs font-medium'
                  >
                    {chip}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {hasHints ? (
          <aside className='rounded-xl border border-border/70 bg-background/85 p-4 sm:p-5'>
            <div className='flex items-center gap-2.5 text-sm font-semibold tracking-tight'>
              <div className='flex size-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'>
                <Sparkles className='h-3.5 w-3.5' />
              </div>
              <span>{hintTitle}</span>
            </div>
            <ul className='mt-4 space-y-2.5'>
              {hints?.map((hint, index) => (
                <li
                  key={`${hint}-${index}`}
                  className='flex items-start gap-2 rounded-lg bg-muted/35 px-3 py-2.5 text-sm leading-relaxed text-muted-foreground'
                >
                  <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70' />
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
