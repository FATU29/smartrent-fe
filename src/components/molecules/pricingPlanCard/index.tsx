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
import { motion } from 'motion/react'
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

// Lower tiers get a subtle colour so the icon reads as a rank at a glance:
// emerald (entry / growth) → sky (mid). The diamond (top) tier intentionally
// drops the amber-gold tint and uses the neutral brand primary instead, so it
// reads as premium without the loud gold colour mapping.
const MEMBERSHIP_LEVEL_TILE_CLASSES: Record<MembershipPackageLevel, string> = {
  [MembershipPackageLevel.BASIC]: 'bg-emerald-500/10 border-emerald-500/20',
  [MembershipPackageLevel.STANDARD]: 'bg-sky-500/10 border-sky-500/20',
  [MembershipPackageLevel.ADVANCED]: 'bg-primary/10 border-primary/15',
}

export const getMembershipLevelTileClasses = (
  level: MembershipPackageLevel,
): string =>
  MEMBERSHIP_LEVEL_TILE_CLASSES[level] ?? 'bg-primary/10 border-primary/15'

export const getMembershipLevelIcon = (
  level: MembershipPackageLevel,
): React.ReactNode => {
  const iconMap: Record<MembershipPackageLevel, React.ReactNode> = {
    [MembershipPackageLevel.BASIC]: (
      <Leaf className='size-7 text-emerald-600 dark:text-emerald-400' />
    ),
    [MembershipPackageLevel.STANDARD]: (
      <Sparkles className='size-7 text-sky-600 dark:text-sky-400' />
    ),
    [MembershipPackageLevel.ADVANCED]: (
      <Crown className='size-7 text-primary' />
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
  /** Show the call-to-action button. Hidden e.g. on the pricing guide page
   *  where cards are informational only. Defaults to true. */
  readonly showCta?: boolean
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
  showCta = true,
}) => {
  const t = useTranslations('pricing')
  const { language } = useSwitchLanguage()
  const locale = language

  const translations = getPricingTranslations(t)
  const hasDiscount = membership.discountPercentage > 0
  const formattedSalePrice = formatByLocale(membership.salePrice, 'vi')
  const formattedOriginalPrice = formatByLocale(membership.originalPrice, 'vi')
  const resolvedPricePeriod = getPricePeriodByLocale(locale)
  const resolvedCta = translations.buyNow
  const discountText = formatDiscountText(membership.discountPercentage)
  const resolvedIcon = getMembershipLevelIcon(membership.packageLevel)
  const resolvedIconTile = getMembershipLevelTileClasses(
    membership.packageLevel,
  )

  const cardVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
  }

  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={cardVariants}
      whileHover={interactive ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      className='h-full w-full'
    >
      <Card
        aria-labelledby={headingId}
        className={getCardStyles(selected, isBestSeller, className)}
      >
        <CardHeader>
          <PricingHeader
            isBestSeller={isBestSeller}
            bestSellerLabel={translations.bestSeller}
            icon={resolvedIcon}
            iconWrapperClassName={resolvedIconTile}
            name={membership.packageName}
            description={membership.description}
            formattedSalePrice={formattedSalePrice}
            formattedOriginalPrice={formattedOriginalPrice}
            hasDiscount={hasDiscount}
            resolvedPricePeriod={resolvedPricePeriod}
            discountText={discountText}
            saveUpToText={translations.saveUpTo}
            locale='vi'
            compact={compact}
            headingId={headingId}
          />
        </CardHeader>
        <CardContent>
          <PricingFeatures benefits={membership.benefits} compact={compact} />
        </CardContent>
        {showCta && (
          <CardFooter className={cn('mt-auto', compact ? 'pt-3' : 'pt-6')}>
            <Button
              className={getButtonStyles(compact)}
              onClick={onSelect}
              aria-label={resolvedCta}
            >
              {resolvedCta}
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
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
