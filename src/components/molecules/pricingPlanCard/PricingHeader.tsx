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
  isBestSeller: boolean
  bestSellerLabel: string
  icon?: React.ReactNode
  name: string
  description?: string
  formattedPrice: string
  resolvedPricePeriod?: string
  discountText?: string
  savingAmountText?: string
  saveUpToText: string
  locale: string
  compact: boolean
  headingId?: string
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
    <>
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
      <div className={getHeaderStyles(compact, isBestSeller)}>
        {icon && (
          <div className='size-14 flex items-center justify-center'>{icon}</div>
        )}
        <h3 id={headingId} className={getTitleStyles(compact)}>
          {name}
        </h3>
        {description && (
          <Typography
            variant='muted'
            as='p'
            className={getDescriptionStyles(compact)}
          >
            {description}
          </Typography>
        )}
        <div className={getPriceContainerStyles(compact)}>
          <div className='flex items-end gap-1 whitespace-nowrap'>
            <span className={getPriceStyles(compact)}>{formattedPrice}</span>
            {resolvedPricePeriod && (
              <span className={getPricePeriodStyles(compact)}>
                {resolvedPricePeriod}
              </span>
            )}
            {discountText && (
              <span className={getDiscountStyles(compact)}>{discountText}</span>
            )}
          </div>
          {savingAmountText && (
            <span className={getSavingStyles(compact)}>
              {saveUpToText}{' '}
              <span className='font-medium text-foreground'>
                {formatSavingByLocale(savingAmountText, locale)}
              </span>
            </span>
          )}
        </div>
      </div>
    </>
  )
}
