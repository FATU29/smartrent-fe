import React from 'react'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { formatByLocale, formatSavingByLocale } from '@/utils/currency/convert'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'

/**
 * PricingPlanCard
 * Reusable card component for displaying subscription / membership plans.
 * Uses existing atoms (Card, Badge, Button, Typography) and tailwind design tokens.
 * No arbitrary colors – relies on semantic classes (primary, muted, destructive, etc.).
 */

export interface PricingPlanFeature {
  label: string
  /** Whether this feature is included in the plan */
  active: boolean
  /** Optional hint / description for the feature */
  hint?: string
}

export interface PricingPlanFeatureGroup {
  /** Group title, e.g., "Gói tin hằng tháng" or "Tiện ích" */
  title?: string
  features: PricingPlanFeature[]
}

export interface PricingPlanCardProps {
  /** Plan name – e.g., "Hội viên Cơ bản" */
  name: string
  /** Brief description underneath name */
  description?: string
  /** Price per period (already formatted or raw number). If number, we format with locale. */
  price: number | string
  /** Period text appended after price (e.g., "d/tháng") */
  pricePeriod?: string
  /** Discount percent (negative number or positive representing the reduction) */
  discountPercent?: number
  /** Money saving amount text (already localized) */
  savingAmountText?: string
  /** Feature groups */
  featureGroups: PricingPlanFeatureGroup[]
  /** CTA label for purchase/select button */
  ctaLabel?: string
  /** Plan icon (React node) */
  icon?: React.ReactNode
  /** Best seller flag – will show a badge */
  isBestSeller?: boolean
  /** Called when CTA button is clicked */
  onSelect?: () => void
  /** Additional className overrides */
  className?: string
  /** Selected state style (outline) */
  selected?: boolean
  /** Accessibility: id for heading linking */
  headingId?: string
  /** Enable subtle interactive hover effects */
  interactive?: boolean
  /** Compact visual variant (for embedded flows) */
  compact?: boolean
}

const PricingPlanCard: React.FC<PricingPlanCardProps> = ({
  name,
  description,
  price,
  pricePeriod,
  discountPercent,
  savingAmountText,
  featureGroups,
  ctaLabel,
  icon,
  isBestSeller = false,
  onSelect,
  className,
  selected = false,
  headingId,
  interactive = true,
  compact = false,
}) => {
  const t = useTranslations('pricing')
  // Use our language context as single source of truth (router.locale not used)
  const { language } = useSwitchLanguage()
  const locale = language

  const formattedPrice =
    typeof price === 'number'
      ? formatByLocale(price, locale)
      : formatByLocale(
          parseInt(String(price).replace(/[^0-9]/g, '')) || 0,
          locale,
        )
  const resolvedPricePeriod =
    pricePeriod || (locale?.startsWith('en') ? '/ month' : '/ tháng')
  const resolvedCta = ctaLabel || t('buyNow')
  const bestSellerLabel = t('bestSeller')
  const discountText =
    typeof discountPercent === 'number'
      ? `(${discountPercent > 0 ? '-' : ''}${Math.abs(discountPercent)}%)`
      : undefined

  return (
    <Card
      aria-labelledby={headingId}
      className={cn(
        'relative h-full transition-all duration-300',
        'bg-gradient-to-b from-background to-background/95 dark:from-background dark:to-background/60',
        interactive &&
          'hover:-translate-y-1 hover:shadow-xl hover:border-primary/60 hover:bg-accent/40 focus-within:-translate-y-1 focus-within:shadow-xl focus-within:border-primary/60 active:translate-y-0',
        selected && 'ring-2 ring-primary shadow-lg',
        isBestSeller &&
          'border-primary/70 shadow-[0_0_0_1px_var(--tw-ring-color)] shadow-primary/10',
        isBestSeller &&
          'before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_60%)]',
        className,
      )}
    >
      {isBestSeller && (
        <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
          <Badge
            variant='secondary'
            className='rounded-b-none rounded-t-md px-3 py-1 text-[11px] tracking-wide'
          >
            {bestSellerLabel}
          </Badge>
        </div>
      )}
      <CardHeader
        className={cn(
          'flex flex-col items-center text-center gap-3',
          compact ? 'pt-6 pb-4' : 'pt-8',
          isBestSeller && 'mt-2',
        )}
      >
        {icon && (
          <div className='size-14 flex items-center justify-center'>{icon}</div>
        )}
        <CardTitle
          id={headingId}
          className={cn('font-semibold', compact ? 'text-base' : 'text-lg')}
        >
          {name}
        </CardTitle>
        {description && (
          <Typography
            variant='muted'
            as='p'
            className={cn(
              'max-w-[240px]',
              compact ? 'text-[11px] leading-snug' : 'text-xs',
            )}
          >
            {description}
          </Typography>
        )}
        <div
          className={cn(
            'flex flex-col items-center gap-1',
            compact ? 'mt-1' : 'mt-2',
          )}
        >
          <div className='flex items-end gap-1 whitespace-nowrap'>
            <span
              className={cn(
                'font-semibold',
                compact ? 'text-xl tracking-tight' : 'text-2xl',
              )}
            >
              {formattedPrice}
            </span>
            {resolvedPricePeriod && (
              <span
                className={cn(
                  'text-muted-foreground',
                  compact ? 'text-[11px]' : 'text-sm',
                )}
              >
                {resolvedPricePeriod}
              </span>
            )}
            {discountText && (
              <span
                className={cn(
                  'text-destructive font-medium',
                  compact ? 'text-[11px]' : 'text-sm',
                )}
              >
                {discountText}
              </span>
            )}
          </div>
          {savingAmountText && (
            <span
              className={cn(
                'text-muted-foreground',
                compact ? 'text-[10px]' : 'text-xs',
              )}
            >
              {t('saveUpTo')}{' '}
              <span className='font-medium text-foreground'>
                {formatSavingByLocale(savingAmountText, locale)}
              </span>
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent
        className={cn(
          'flex flex-col',
          compact ? 'gap-4 mt-2 pb-2' : 'gap-6 mt-4',
        )}
      >
        {featureGroups.map((group, gi) => (
          <div key={gi} className='flex flex-col gap-3'>
            {group.title && (
              <Typography
                variant='small'
                as='h6'
                className={cn(
                  'font-semibold tracking-tight',
                  compact && 'text-[11px]',
                )}
              >
                {group.title}
              </Typography>
            )}
            <ul className='flex flex-col gap-2'>
              {group.features.map((f, fi) => (
                <li
                  key={fi}
                  className={cn(
                    'flex items-start gap-2',
                    compact ? 'text-[11px]' : 'text-sm',
                  )}
                >
                  <FeatureIcon active={f.active} />
                  <span
                    className={cn(
                      !f.active &&
                        'text-muted-foreground line-through opacity-60',
                    )}
                  >
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
      <CardFooter className={cn('mt-auto', compact ? 'pt-3' : 'pt-6')}>
        <Button
          className={cn(
            'w-full transition-transform',
            interactive && 'hover:translate-y-[-2px] active:translate-y-0',
          )}
          onClick={onSelect}
          aria-label={resolvedCta}
          size={compact ? 'sm' : undefined}
        >
          {resolvedCta}
        </Button>
      </CardFooter>
    </Card>
  )
}

const FeatureIcon: React.FC<{ active: boolean }> = ({ active }) => {
  if (active) {
    return (
      <svg
        className='size-4 shrink-0 text-emerald-500'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M20 6 9 17l-5-5' />
      </svg>
    )
  }
  return (
    <svg
      className='size-4 text-muted-foreground shrink-0'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='m5 12 5 5L20 7' className='opacity-30' />
    </svg>
  )
}

export default PricingPlanCard

// Skeleton version while loading pricing plans
export const PricingPlanCardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div
      className={cn(
        'relative h-full bg-card border rounded-xl p-6 flex flex-col gap-5',
        className,
      )}
    >
      <div className='flex flex-col items-center text-center gap-3 mt-2'>
        <div className='bg-accent/60 rounded-full size-14 animate-pulse' />
        <div className='h-4 w-40 bg-accent rounded animate-pulse' />
        <div className='h-3 w-56 bg-accent rounded animate-pulse' />
        <div className='flex flex-col items-center gap-2 mt-2 w-full'>
          <div className='flex items-end gap-2'>
            <div className='h-7 w-28 bg-accent rounded animate-pulse' />
            <div className='h-4 w-14 bg-accent rounded animate-pulse' />
          </div>
          <div className='h-3 w-44 bg-accent rounded animate-pulse' />
        </div>
      </div>
      <div className='flex flex-col gap-6 mt-4'>
        {[0, 1].map((i) => (
          <div key={i} className='flex flex-col gap-3'>
            <div className='h-4 w-32 bg-accent rounded animate-pulse' />
            <ul className='flex flex-col gap-2'>
              {[0, 1, 2].map((j) => (
                <li key={j} className='flex items-center gap-2'>
                  <div className='size-4 bg-accent rounded-full animate-pulse' />
                  <div className='h-3 w-52 bg-accent rounded animate-pulse' />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className='mt-auto pt-6'>
        <div className='h-9 w-full bg-accent rounded-md animate-pulse' />
      </div>
    </div>
  )
}
