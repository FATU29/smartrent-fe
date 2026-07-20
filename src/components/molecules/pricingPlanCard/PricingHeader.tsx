import React from 'react'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import { formatSavingByLocale } from '@/utils/currency/convert'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
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
  readonly iconWrapperClassName?: string
  readonly name: string
  readonly description?: string
  readonly formattedSalePrice: string
  readonly formattedOriginalPrice: string
  readonly hasDiscount: boolean
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
  iconWrapperClassName,
  name,
  description,
  formattedSalePrice,
  formattedOriginalPrice,
  hasDiscount,
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='absolute -top-3 left-1/2 -translate-x-1/2'
        >
          <Badge
            variant='secondary'
            className='rounded-b-none rounded-t-md px-3 py-1 text-2xs tracking-wide'
          >
            {bestSellerLabel}
          </Badge>
        </motion.div>
      )}
      <Typography as='div' className={getHeaderStyles(compact, isBestSeller)}>
        {icon ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05, ease: 'easeOut' }}
            className={cn(
              'size-12 flex items-center justify-center rounded-lg border',
              iconWrapperClassName ?? 'bg-primary/10 border-primary/15',
            )}
          >
            {icon}
          </motion.div>
        ) : (
          <Typography
            as='div'
            className='size-12 flex items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-medium'
            title='Icon missing - check packageLevel prop'
          >
            ?
          </Typography>
        )}
        <motion.h3
          id={headingId}
          className={getTitleStyles(compact)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          {name}
        </motion.h3>
        {description && (
          <motion.p
            className={getDescriptionStyles(compact)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.15 }}
          >
            <Typography variant='muted' as='span'>
              {description}
            </Typography>
          </motion.p>
        )}
        <motion.div
          className={getPriceContainerStyles(compact)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.2 }}
        >
          <Typography as='div' className='flex flex-col items-start gap-1'>
            <Typography
              as='div'
              className='flex items-end gap-1 whitespace-nowrap'
            >
              <Typography as='span' className={getPriceStyles(compact)}>
                {formattedSalePrice}
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
            {hasDiscount && (
              <Typography
                as='span'
                className='text-sm text-muted-foreground line-through'
              >
                {formattedOriginalPrice} {resolvedPricePeriod}
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
        </motion.div>
      </Typography>
    </Typography>
  )
}
