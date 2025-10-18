import React, { useCallback, useMemo } from 'react'
import PricingPlanCard, {
  PricingPlanCardSkeleton,
} from '@/components/molecules/pricingPlanCard'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import type { Membership } from '@/api/types/memembership.type'
import { transformMembershipToPricingCard } from './utils'

interface MembershipPlansGridProps {
  readonly loading?: boolean
  readonly memberships?: readonly Membership[]
  readonly onPlanSelect?: (membershipId: number) => void
}

const SKELETON_COUNT = 3

export const MembershipPlansGrid: React.FC<MembershipPlansGridProps> = ({
  loading = false,
  memberships = [],
  onPlanSelect,
}) => {
  const tPage = useTranslations('membershipPage')

  const handlePlanSelect = useCallback(
    (membershipId: number) => {
      onPlanSelect?.(membershipId)
    },
    [onPlanSelect],
  )

  const transformedPlans = useMemo(
    () => memberships.map(transformMembershipToPricingCard),
    [memberships],
  )

  if (loading) {
    return (
      <span className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <PricingPlanCardSkeleton key={`skeleton-${index}`} />
        ))}
      </span>
    )
  }

  if (transformedPlans.length === 0) {
    return (
      <span className='flex items-center justify-center py-12'>
        <Typography variant='muted'>{tPage('noPlansAvailable')}</Typography>
      </span>
    )
  }

  return (
    <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
      {transformedPlans.map((plan) => (
        <PricingPlanCard
          key={plan.id}
          name={plan.name}
          description={plan.description}
          price={plan.price}
          discountPercent={plan.discountPercent}
          featureGroups={plan.featureGroups}
          isBestSeller={plan.isBestSeller}
          packageLevel={plan.packageLevel}
          onSelect={() => handlePlanSelect(plan.id)}
        />
      ))}
    </div>
  )
}
