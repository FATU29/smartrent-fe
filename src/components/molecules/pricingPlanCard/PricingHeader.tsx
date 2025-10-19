import React from 'react'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import { formatSavingByLocale } from '@/utils/currency/convert'
import {
  getHeaderStyles,
  getTitleStyles,
  getDescriptionStyles,
  getPriceContainerStyles,
  getPriceStyles,
  getPricePeriodStyles,
  getDiscountStyles,
  getSavingStyles,
} from './styles'

interface PricingHeaderProps {
  readonly isBestSeller: boolean
  readonly bestSellerLabel: string
  readonly icon?: React.ReactNode
  readonly name: string
  readonly description?: string
  readonly formattedPrice: string
  readonly resolvedPricePeriod?: string
  readonly discountText?: string
  readonly savingAmountText?: string
  readonly saveUpToText: string
  readonly locale: string
  readonly compact: boolean
  readonly headingId?: string
}

export const PricingHeader: React.FC<PricingHeaderProps> = ({
  isBestSeller,
  bestSellerLabel,
  icon,
  name,
  description,
  formattedPrice,
  resolvedPricePeriod,
  discountText,
  savingAmountText,
  saveUpToText,
  locale,
  compact,
  headingId,
}) => {
  return (
    <Typography as='div'>
      {isBestSeller && (
        <Typography
          as='div'
          className='absolute -top-3 left-1/2 -translate-x-1/2'
        >
          <Badge
            variant='secondary'
            className='rounded-b-none rounded-t-md px-3 py-1 text-[11px] tracking-wide'
          >
            {bestSellerLabel}
          </Badge>
        </Typography>
      )}
      <Typography as='div' className={getHeaderStyles(compact, isBestSeller)}>
        {icon ? (
          <Typography
            as='div'
            className='size-14 flex items-center justify-center'
          >
            {icon}
          </Typography>
        ) : (
          <Typography
            as='div'
            className='size-14 flex items-center justify-center bg-red-100 text-red-500 rounded-full text-xs font-bold'
            title='Icon missing - check packageLevel prop'
          >
            ?
          </Typography>
        )}
        <Typography as='h3' id={headingId} className={getTitleStyles(compact)}>
          {name}
        </Typography>
        {description && (
          <Typography
            variant='muted'
            as='p'
            className={getDescriptionStyles(compact)}
          >
            {description}
          </Typography>
        )}
        <Typography as='div' className={getPriceContainerStyles(compact)}>
          <Typography
            as='div'
            className='flex items-end gap-1 whitespace-nowrap'
          >
            <Typography as='span' className={getPriceStyles(compact)}>
              {formattedPrice}
            </Typography>
            {resolvedPricePeriod && (
              <Typography as='span' className={getPricePeriodStyles(compact)}>
                {resolvedPricePeriod}
              </Typography>
            )}
            {discountText && (
              <Typography as='span' className={getDiscountStyles(compact)}>
                {discountText}
              </Typography>
            )}
          </Typography>
          {savingAmountText && (
            <Typography as='span' className={getSavingStyles(compact)}>
              {saveUpToText}{' '}
              <Typography as='span' className='font-medium text-foreground'>
                {formatSavingByLocale(savingAmountText, locale)}
              </Typography>
            </Typography>
          )}
        </Typography>
      </Typography>
    </Typography>
  )
}
