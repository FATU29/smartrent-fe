import {
  MembershipPackageLevel,
  type Membership,
  type TransformedMembershipPlan,
} from '@/api/types/memembership.type'

export const transformMembershipToPricingCard = (
  membership: Membership,
): TransformedMembershipPlan => {
  const featureGroups = membership.benefits
    ? [
        {
          features: membership.benefits.map((benefit) => {
            const displayName = benefit.benefitNameDisplay
            const quantity = benefit.quantityPerMonth

            const startsWithNumber = /^\d+/.test(displayName)
            const label = startsWithNumber
              ? displayName
              : `${quantity} ${displayName}`

            return {
              label,
              active: true,
              hint: benefit.benefitType,
            }
          }),
        },
      ]
    : []

  return {
    id: membership.membershipId,
    name: membership.packageName,
    description: membership.description || '',
    price: membership.salePrice,
    discountPercent: membership.discountPercentage,
    packageLevel: membership.packageLevel,
    featureGroups,
    isBestSeller: membership.packageLevel === MembershipPackageLevel.STANDARD,
  }
}

export const generateMembershipSkeletons = (
  count: number = 3,
): TransformedMembershipPlan[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    name: '',
    description: '',
    price: 0,
    discountPercent: 0,
    icon: null,
    featureGroups: [],
    isBestSeller: false,
  }))
}
