import React from 'react'
import PricingPlanCard, {
  PricingPlanCardSkeleton,
} from '@/components/molecules/pricingPlanCard'
import { useTranslations } from 'next-intl'
import { MEMBERSHIP_PLANS } from '@/data/membership/data'
import { translateMembershipPlan } from './utils'

interface MembershipPlansGridProps {
  loading?: boolean
  onPlanSelect?: (planId: string) => void
}

export const MembershipPlansGrid: React.FC<MembershipPlansGridProps> = ({
  loading = false,
  onPlanSelect,
}) => {
  const tPlans = useTranslations('membershipPlans')
  const handlePlanSelect = (planId: string) => {
    console.log('membership-select', planId)
    onPlanSelect?.(planId)
  }

  if (loading) {
    return (
      <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
        <PricingPlanCardSkeleton />
        <PricingPlanCardSkeleton />
        <PricingPlanCardSkeleton />
      </div>
    )
  }

  return (
    <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
      {MEMBERSHIP_PLANS.map((plan) => {
        const translatedPlan = translateMembershipPlan(plan, tPlans)

        return (
          <PricingPlanCard
            key={plan.id}
            name={translatedPlan.name}
            description={translatedPlan.description}
            price={translatedPlan.price}
            discountPercent={translatedPlan.discountPercent}
            savingAmountText={translatedPlan.savingAmountText}
            featureGroups={translatedPlan.featureGroups}
            isBestSeller={translatedPlan.bestSeller}
            icon={translatedPlan.icon}
            onSelect={() => handlePlanSelect(plan.id)}
          />
        )
      })}
    </div>
  )
}
