import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { formatByLocale, formatSavingByLocale } from '@/utils/currency/convert'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
import { useTranslations } from 'next-intl'

/**
 * VoucherPackageCard
 * For displaying push voucher bundles (e.g., 30 / 50 / 100 vouchers) with discount & saving info.
 * Reuses existing atoms; fully i18n using "voucher" namespace.
 */

export interface VoucherPackageCardProps {
  /** e.g. 30, 50, 100 */
  voucherCount: number
  /** Validity period in days */
  periodDays: number
  /** Price (raw number or preformatted string). If number, localized with vi-VN for grouping. */
  price: number | string
  /** Discount percent (positive number for reduction) */
  discountPercent?: number
  /** Saving amount localized string (e.g. "60.000 đ") */
  savingAmountText?: string
  /** Optional description below highlight bar (auto generated if not provided). */
  customDescription?: string
  /** Icon node displayed top-right */
  icon?: React.ReactNode
  /** Is best seller */
  isBestSeller?: boolean
  /** CTA label override */
  ctaLabel?: string
  /** Called when user clicks purchase */
  onSelect?: () => void
  /** Highlight bar background class override */
  highlightClassName?: string
  /** Card class override */
  className?: string
  /** Selected visual state */
  selected?: boolean
  /** Enable subtle interactive hover effects */
  interactive?: boolean
}

const VoucherPackageCard: React.FC<VoucherPackageCardProps> = ({
  voucherCount,
  periodDays,
  price,
  discountPercent,
  savingAmountText,
  customDescription,
  icon,
  isBestSeller,
  ctaLabel,
  onSelect,
  highlightClassName,
  className,
  selected,
  interactive = true,
}) => {
  const t = useTranslations('voucher')
  const { language } = useSwitchLanguage()
  const locale = language
  const formattedPrice =
    typeof price === 'number'
      ? formatByLocale(price, locale)
      : formatByLocale(
          parseInt(String(price).replace(/[^0-9]/g, '')) || 0,
          locale,
        )
  const discountText =
    typeof discountPercent === 'number' ? `(-${discountPercent}%)` : undefined
  const resolvedCta = ctaLabel || t('buyNow')
  const unit = voucherCount === 1 ? t('voucherUnit') : t('voucherPlural')
  const period = `${periodDays} ${t('daySuffix')}`
  const title = `${t('voucherUnit').charAt(0).toUpperCase() + t('voucherUnit').slice(1)} ${voucherCount} ${unit}`
  const description =
    customDescription ||
    t('pushDescription', { count: voucherCount, amount: '10.000' })

  return (
    <Card
      className={cn(
        'relative h-full transition-colors pt-3',
        interactive &&
          'hover:-translate-y-1 hover:shadow-lg hover:border-primary/60 hover:bg-accent/40 focus-within:-translate-y-1 focus-within:shadow-lg focus-within:border-primary/60 active:translate-y-0',
        selected && 'ring-2 ring-primary shadow-md',
        isBestSeller && 'border-primary',
        className,
      )}
      aria-label={title}
    >
      {isBestSeller && (
        <div className='absolute -top-3 left-1/2 -translate-x-1/2 z-10'>
          <Badge
            variant='secondary'
            className='rounded-b-none rounded-t-md px-3 py-1 text-[11px] tracking-wide'
          >
            {t('bestSeller')}
          </Badge>
        </div>
      )}
      <CardHeader
        className={cn('pt-8 pb-4 flex flex-col gap-2', isBestSeller && 'mt-2')}
      >
        <div className='flex items-start justify-between'>
          <div className='flex flex-col gap-1'>
            <CardTitle className='text-base font-semibold flex flex-wrap items-center gap-1'>
              {title}{' '}
              <span className='text-muted-foreground font-normal'>
                / {period}
              </span>
            </CardTitle>
          </div>
          {icon && (
            <div className='size-12 rounded-full bg-muted flex items-center justify-center shrink-0'>
              {icon}
            </div>
          )}
        </div>
        <div className='flex flex-col gap-1 mt-2'>
          <div className='flex items-end gap-1'>
            {/* formattedPrice already contains symbol for USD or adds ₫ suffix for VND */}
            <span className='text-2xl font-semibold'>{formattedPrice}</span>
            {discountText && (
              <span className='text-sm text-destructive font-medium'>
                {discountText}
              </span>
            )}
          </div>
          {savingAmountText && (
            <span className='text-xs text-muted-foreground'>
              {t('savingPrefix')}{' '}
              <span className='font-medium text-foreground'>
                {formatSavingByLocale(savingAmountText, locale)}
              </span>
            </span>
          )}
        </div>
      </CardHeader>
      <CardFooter className='pt-0 pb-6'>
        <Button
          variant='outline'
          className={cn(
            'w-full transition-transform',
            interactive && 'hover:translate-y-[-2px] active:translate-y-0',
          )}
          onClick={onSelect}
          aria-label={resolvedCta}
        >
          {resolvedCta}
        </Button>
      </CardFooter>
      <CardContent className={cn('border-t px-0 pt-0', 'bg-accent/40')}>
        <div
          className={cn(
            'flex items-start gap-2 px-5 py-3 text-sm',
            highlightClassName,
          )}
        >
          <TicketIcon />
          <Typography
            as='p'
            variant='muted'
            className='text-[13px] leading-relaxed text-foreground/80'
          >
            {description}
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

const TicketIcon = () => (
  <span className='inline-flex items-center justify-center rounded-full bg-primary/10 text-primary size-6 shrink-0'>
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='size-4'
    >
      <path d='M3 8V6a2 2 0 0 1 2-2h4l2 2h4l2-2h4a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2h-4l-2-2h-4l-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z' />
    </svg>
  </span>
)

export default VoucherPackageCard

// Skeleton for voucher card
export const VoucherPackageCardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div
      className={cn(
        'relative h-full bg-card border rounded-xl p-6 flex flex-col gap-5',
        className,
      )}
    >
      <div className='flex flex-col gap-4'>
        <div className='flex items-start justify-between'>
          <div className='h-4 w-48 bg-accent rounded animate-pulse' />
          <div className='size-12 bg-accent/60 rounded-full animate-pulse' />
        </div>
        <div className='flex flex-col gap-2'>
          <div className='flex items-end gap-2'>
            <div className='h-7 w-32 bg-accent rounded animate-pulse' />
            <div className='h-5 w-6 bg-accent rounded animate-pulse' />
            <div className='h-4 w-12 bg-accent rounded animate-pulse' />
          </div>
          <div className='h-3 w-40 bg-accent rounded animate-pulse' />
        </div>
      </div>
      <div className='mt-auto pt-2'>
        <div className='h-9 w-full bg-accent rounded-md animate-pulse' />
      </div>
      <div className='border-t mt-5 -mx-6 w-[calc(100%+3rem)] bg-accent/40 px-5 py-4'>
        <div className='h-4 w-64 bg-accent rounded animate-pulse' />
      </div>
    </div>
  )
}
