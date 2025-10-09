import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardFooter } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/utils'
import { formatByLocale } from '@/utils/currency/convert'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
import { PricingHeader } from './PricingHeader'
import { PricingFeatures } from './PricingFeatures'
import {
  getPricingTranslations,
  getPricePeriodByLocale,
  formatDiscountText,
} from './translations'
import { getCardStyles, getButtonStyles } from './styles'

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
  const { language } = useSwitchLanguage()
  const locale = language

  // Extract translation texts
  const translations = getPricingTranslations(t)

  // Format price
  const formattedPrice =
    typeof price === 'number'
      ? formatByLocale(price, locale)
      : formatByLocale(
          parseInt(String(price).replace(/[^0-9]/g, '')) || 0,
          locale,
        )

  // Resolve pricing metadata
  const resolvedPricePeriod = pricePeriod || getPricePeriodByLocale(locale)
  const resolvedCta = ctaLabel || translations.buyNow
  const discountText = formatDiscountText(discountPercent)

  return (
    <Card
      aria-labelledby={headingId}
      className={getCardStyles(interactive, selected, isBestSeller, className)}
    >
      <PricingHeader
        isBestSeller={isBestSeller}
        bestSellerLabel={translations.bestSeller}
        icon={icon}
        name={name}
        description={description}
        formattedPrice={formattedPrice}
        resolvedPricePeriod={resolvedPricePeriod}
        discountText={discountText}
        savingAmountText={savingAmountText}
        saveUpToText={translations.saveUpTo}
        locale={locale}
        compact={compact}
        headingId={headingId}
      />
      <CardContent>
        <PricingFeatures featureGroups={featureGroups} compact={compact} />
      </CardContent>
      <CardFooter className={cn('mt-auto', compact ? 'pt-3' : 'pt-6')}>
        <Button
          className={getButtonStyles(interactive)}
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
