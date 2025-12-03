import React, { useCallback } from 'react'
import PricingPlanCard, {
  PricingPlanCardSkeleton,
} from '@/components/molecules/pricingPlanCard'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import type { Membership } from '@/api/types/membership.type'

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

  if (loading) {
    return (
      <span className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <PricingPlanCardSkeleton key={`skeleton-${index}`} />
        ))}
      </span>
    )
  }

  const safeMemberships: readonly Membership[] = Array.isArray(memberships)
    ? memberships
    : (memberships as unknown as { items?: readonly Membership[] })?.items || []

  if (safeMemberships.length === 0) {
    return (
      <span className='flex items-center justify-center py-12'>
        <Typography variant='muted'>{tPage('noPlansAvailable')}</Typography>
      </span>
    )
  }

  return (
    <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
      {safeMemberships.map((plan) => (
        <PricingPlanCard
          key={plan.membershipId}
          membership={plan}
          onSelect={() => handlePlanSelect(plan.membershipId)}
        />
      ))}
    </div>
  )
}
