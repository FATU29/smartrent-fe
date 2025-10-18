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
import { Skeleton } from '@/components/atoms/skeleton'
import { cn } from '@/lib/utils'
import { formatByLocale, formatSavingByLocale } from '@/utils/currency/convert'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
import { useTranslations } from 'next-intl'
import type { PushDetail } from '@/api/types/push.type'

export interface VoucherPackageCardProps {
  readonly pushDetail: PushDetail
  readonly icon?: React.ReactNode
  readonly isBestSeller?: boolean
  readonly ctaLabel?: string
  readonly onSelect?: () => void
  readonly highlightClassName?: string
  readonly className?: string
  readonly selected?: boolean
  readonly interactive?: boolean
}

const VoucherPackageCard: React.FC<VoucherPackageCardProps> = ({
  pushDetail,
  icon,
  isBestSeller = false,
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

  const formattedPrice = formatByLocale(pushDetail.totalPrice, locale)
  const discountText =
    pushDetail.discountPercentage > 0
      ? `(-${pushDetail.discountPercentage}%)`
      : undefined
  const resolvedCta = ctaLabel || t('buyNow')

  // Use English or Vietnamese name based on locale
  const title =
    locale === 'en' ? pushDetail.detailNameEn : pushDetail.detailName
  const description =
    pushDetail.description ||
    t('pushDescription', {
      count: pushDetail.quantity,
      amount: formatByLocale(pushDetail.pricePerPush, locale),
    })

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
        <Typography as='div' className='flex items-start justify-between'>
          <Typography as='div' className='flex flex-col gap-1'>
            <CardTitle className='text-base font-semibold'>{title}</CardTitle>
            <Typography as='p' variant='muted' className='text-sm'>
              {pushDetail.quantity} {t('voucherUnit')} -{' '}
              {formatByLocale(pushDetail.pricePerPush, locale)} {t('perPush')}
            </Typography>
          </Typography>
          {icon && (
            <Typography
              as='div'
              className='size-12 rounded-full bg-muted flex items-center justify-center shrink-0'
            >
              {icon}
            </Typography>
          )}
        </Typography>
        <Typography as='div' className='flex flex-col gap-1 mt-2'>
          <Typography as='div' className='flex items-end gap-1'>
            <Typography as='span' className='text-2xl font-semibold'>
              {formattedPrice}
            </Typography>
            {discountText && (
              <Typography
                as='span'
                className='text-sm text-destructive font-medium'
              >
                {discountText}
              </Typography>
            )}
          </Typography>
          {pushDetail.savings > 0 && (
            <Typography as='span' className='text-xs text-muted-foreground'>
              {t('savingPrefix')}{' '}
              <Typography as='span' className='font-medium text-foreground'>
                {formatSavingByLocale(pushDetail.savings.toString(), locale)}
              </Typography>
            </Typography>
          )}
        </Typography>
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

/**
 * VoucherPackageCardSkeleton
 * Loading skeleton for voucher package cards using Skeleton atoms
 */
export const VoucherPackageCardSkeleton: React.FC<{
  readonly className?: string
}> = ({ className }) => {
  return (
    <Card className={cn('relative h-full flex flex-col gap-5', className)}>
      <CardHeader className='flex flex-col gap-4'>
        <Typography as='div' className='flex items-start justify-between'>
          <Skeleton className='h-4 w-48' />
          <Skeleton className='size-12 rounded-full' />
        </Typography>
        <Typography as='div' className='flex flex-col gap-2'>
          <Typography as='div' className='flex items-end gap-2'>
            <Skeleton className='h-7 w-32' />
            <Skeleton className='h-5 w-6' />
            <Skeleton className='h-4 w-12' />
          </Typography>
          <Skeleton className='h-3 w-40' />
        </Typography>
      </CardHeader>
      <CardFooter className='mt-auto pt-2'>
        <Skeleton className='h-9 w-full' />
      </CardFooter>
      <CardContent className='border-t bg-accent/40 px-5 py-4'>
        <Skeleton className='h-4 w-64' />
      </CardContent>
    </Card>
  )
}
