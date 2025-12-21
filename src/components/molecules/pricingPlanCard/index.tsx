import React from 'react'
import { useTranslations } from 'next-intl'
import { Leaf, Sparkles, Crown } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { formatByLocale } from '@/utils/currency/convert'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
// MembershipPackageLevel is imported below with BenefitType
import { PricingHeader } from './PricingHeader'
import { PricingFeatures } from './PricingFeatures'
import {
  getPricingTranslations,
  getPricePeriodByLocale,
  formatDiscountText,
} from './translations'
import { getCardStyles, getButtonStyles } from './styles'
import type { Membership } from '@/api/types/membership.type'
import { MembershipPackageLevel } from '@/api/types/membership.type'

export const getMembershipLevelIcon = (
  level: MembershipPackageLevel,
): React.ReactNode => {
  const iconMap: Record<MembershipPackageLevel, React.ReactNode> = {
    [MembershipPackageLevel.BASIC]: (
      <Leaf className='size-10 text-emerald-500' />
    ),
    [MembershipPackageLevel.STANDARD]: (
      <Sparkles className='size-10 text-blue-500' />
    ),
    [MembershipPackageLevel.ADVANCED]: (
      <Crown className='size-10 text-amber-500' />
    ),
  }

  return iconMap[level]
}

export interface PricingPlanBenefit {
  readonly label: string
  readonly active: boolean
  readonly hint?: string
}

export interface PricingPlanCardProps {
  readonly membership: Membership
  readonly isBestSeller?: boolean
  readonly onSelect?: () => void
  readonly className?: string
  readonly selected?: boolean
  readonly headingId?: string
  readonly interactive?: boolean
  readonly compact?: boolean
}

const PricingPlanCard: React.FC<PricingPlanCardProps> = ({
  membership,
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

  const translations = getPricingTranslations(t)
  const hasDiscount = membership.discountPercentage > 0
  const formattedSalePrice = formatByLocale(membership.salePrice, locale)
  const formattedOriginalPrice = formatByLocale(
    membership.originalPrice,
    locale,
  )
  const resolvedPricePeriod = getPricePeriodByLocale(locale)
  const resolvedCta = translations.buyNow
  const discountText = formatDiscountText(membership.discountPercentage)
  const resolvedIcon = getMembershipLevelIcon(membership.packageLevel)

  return (
    <Card
      aria-labelledby={headingId}
      className={getCardStyles(interactive, selected, isBestSeller, className)}
    >
      <CardHeader>
        <PricingHeader
          isBestSeller={isBestSeller}
          bestSellerLabel={translations.bestSeller}
          icon={resolvedIcon}
          name={membership.packageName}
          description={membership.description}
          formattedSalePrice={formattedSalePrice}
          formattedOriginalPrice={formattedOriginalPrice}
          hasDiscount={hasDiscount}
          resolvedPricePeriod={resolvedPricePeriod}
          discountText={discountText}
          saveUpToText={translations.saveUpTo}
          locale={locale}
          compact={compact}
          headingId={headingId}
        />
      </CardHeader>
      <CardContent>
        <PricingFeatures benefits={membership.benefits} compact={compact} />
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

export const PricingPlanCardSkeleton: React.FC<{
  readonly className?: string
}> = ({ className }) => {
  return (
    <Card className={cn('relative h-full flex flex-col gap-5', className)}>
      <CardHeader className='flex flex-col items-center text-center gap-3'>
        <Skeleton className='rounded-full size-14' />
        <Skeleton className='h-4 w-40' />
        <Skeleton className='h-3 w-56' />
        <Typography
          as='div'
          className='flex flex-col items-center gap-2 mt-2 w-full'
        >
          <Typography as='div' className='flex items-end gap-2'>
            <Skeleton className='h-7 w-28' />
            <Skeleton className='h-4 w-14' />
          </Typography>
          <Skeleton className='h-3 w-44' />
        </Typography>
      </CardHeader>
      <CardContent className='flex flex-col gap-6 mt-4'>
        {[0, 1].map((i) => (
          <Typography key={i} as='div' className='flex flex-col gap-3'>
            <Skeleton className='h-4 w-32' />
            <Typography as='div' className='flex flex-col gap-2'>
              {[0, 1, 2].map((j) => (
                <Typography
                  key={j}
                  as='div'
                  className='flex items-center gap-2'
                >
                  <Skeleton className='size-4 rounded-full' />
                  <Skeleton className='h-3 w-52' />
                </Typography>
              ))}
            </Typography>
          </Typography>
        ))}
      </CardContent>
      <CardFooter className='mt-auto pt-6'>
        <Skeleton className='h-9 w-full' />
      </CardFooter>
    </Card>
  )
}
