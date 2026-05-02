'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Hourglass, Sparkles, Clock } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Progress } from '@/components/atoms/progress'
import { cn } from '@/lib/utils'

export interface PushLimitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Wait time the backend reported, in minutes. */
  waitMinutes: number
  /**
   * Optional raw message returned by the backend. Already localized server-side
   * — shown verbatim under the title for transparency.
   */
  apiMessage?: string | null
  /**
   * Optional secondary action — e.g., navigate to a "schedule push" page.
   * Hidden when not provided.
   */
  onScheduleInstead?: () => void
}

const formatRemaining = (
  totalSeconds: number,
  fmt: (
    key: 'mFull' | 'sFull' | 'sShort',
    vals?: Record<string, number>,
  ) => string,
): string => {
  const safe = Math.max(0, totalSeconds)
  const m = Math.floor(safe / 60)
  const s = safe % 60
  if (m <= 0) {
    return fmt('sShort', { seconds: s })
  }
  return `${fmt('mFull', { minutes: m })} ${fmt('sFull', { seconds: s })}`
}

const PushLimitModal: React.FC<PushLimitModalProps> = ({
  open,
  onOpenChange,
  waitMinutes,
  apiMessage,
  onScheduleInstead,
}) => {
  const t = useTranslations('seller.pushLimit')

  // Defensive clamp — backend always sends >= 1, but be safe.
  const initialSeconds = useMemo(
    () => Math.max(60, Math.round(waitMinutes * 60)),
    [waitMinutes],
  )

  const [remaining, setRemaining] = useState(initialSeconds)
  const startedAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (!open) {
      startedAtRef.current = null
      setRemaining(initialSeconds)
      return
    }

    startedAtRef.current = Date.now()
    setRemaining(initialSeconds)

    const tick = () => {
      const started = startedAtRef.current
      if (started === null) return
      const elapsed = Math.floor((Date.now() - started) / 1000)
      setRemaining(Math.max(0, initialSeconds - elapsed))
    }

    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [open, initialSeconds])

  const percent = useMemo(() => {
    if (initialSeconds <= 0) return 100
    return Math.min(100, ((initialSeconds - remaining) / initialSeconds) * 100)
  }, [initialSeconds, remaining])

  const remainingLabel = formatRemaining(remaining, (key, vals) => {
    if (key === 'mFull') return t('countdown.minutes', vals)
    if (key === 'sFull') return t('countdown.seconds', vals)
    return t('countdown.secondsShort', vals)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'w-[calc(100vw-2rem)] max-w-md p-0 overflow-hidden',
          'bg-background border-border',
        )}
      >
        {/* Decorative gradient header */}
        <div
          className={cn(
            'relative px-6 pt-7 pb-6',
            'bg-gradient-to-br from-primary/15 via-primary/5 to-transparent',
            'dark:from-primary/25 dark:via-primary/10',
          )}
        >
          <div
            aria-hidden='true'
            className='absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl'
          />
          <div
            aria-hidden='true'
            className='absolute -bottom-12 -left-8 h-24 w-24 rounded-full bg-amber-500/20 blur-3xl'
          />

          <div className='relative flex flex-col items-center text-center gap-3'>
            <div
              className={cn(
                'relative flex h-16 w-16 items-center justify-center rounded-full',
                'bg-background shadow-md ring-1 ring-border',
              )}
            >
              <Hourglass
                className='h-8 w-8 text-primary animate-[spin_4s_linear_infinite]'
                strokeWidth={1.75}
              />
              <Sparkles
                className='absolute -top-1 -right-1 h-4 w-4 text-amber-500'
                aria-hidden='true'
              />
            </div>

            <DialogHeader className='gap-1.5 pb-0 sm:text-center text-center'>
              <DialogTitle className='text-xl font-semibold text-foreground'>
                {t('title')}
              </DialogTitle>
              <DialogDescription className='text-sm text-muted-foreground'>
                {t('subtitle')}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Body */}
        <div className='px-6 pb-6 pt-1 space-y-5'>
          {/* Countdown card */}
          <div
            className={cn(
              'rounded-xl border border-border bg-muted/40 p-4',
              'flex items-center gap-3',
            )}
          >
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <Clock className='h-5 w-5' aria-hidden='true' />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='text-2xs uppercase tracking-wide text-muted-foreground font-medium'>
                {t('countdown.label')}
              </div>
              <div
                className='text-lg font-semibold text-foreground tabular-nums'
                aria-live='polite'
              >
                {remainingLabel}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className='space-y-1.5'>
            <Progress value={percent} className='h-1.5' />
            <div className='flex justify-between text-2xs text-muted-foreground'>
              <span>{t('progress.start')}</span>
              <span>{t('progress.end')}</span>
            </div>
          </div>

          {/* API message — already localized server-side */}
          {apiMessage ? (
            <p className='text-sm leading-relaxed text-foreground/80 bg-muted/30 rounded-lg px-3 py-2 border border-border/60'>
              {apiMessage}
            </p>
          ) : null}

          {/* Tip */}
          <p className='text-xs text-muted-foreground'>{t('tip')}</p>

          {/* Actions */}
          <div className='flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1'>
            {onScheduleInstead ? (
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  onOpenChange(false)
                  onScheduleInstead()
                }}
              >
                {t('actions.schedule')}
              </Button>
            ) : null}
            <Button
              type='button'
              variant='default'
              onClick={() => onOpenChange(false)}
              className='sm:min-w-32'
            >
              {t('actions.gotIt')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PushLimitModal
