import React from 'react'
import PricingPlanCard, {
  PricingPlanCardSkeleton,
} from '@/components/molecules/pricingPlanCard'
import { useTranslations } from 'next-intl'
import { VOUCHER_PACKAGES } from '@/data/membership/data'
import { translateVoucherPackage } from './utils'
import { getVoucherIcon } from '@/data/membership/data'

interface VoucherPackagesGridProps {
  loading?: boolean
  onPackageSelect?: (packageId: string) => void
}

export const VoucherPackagesGrid: React.FC<VoucherPackagesGridProps> = ({
  loading = false,
  onPackageSelect,
}) => {
  const tVouchers = useTranslations('voucherPackages')

  const handlePackageSelect = (packageId: string) => {
    console.log('voucher-select', packageId)
    onPackageSelect?.(packageId)
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
      {VOUCHER_PACKAGES.map((voucherPackage) => {
        const translatedPackage = translateVoucherPackage(
          voucherPackage,
          tVouchers,
        )

        return (
          <PricingPlanCard
            key={voucherPackage.id}
            name={translatedPackage.name}
            description={translatedPackage.description}
            price={translatedPackage.price}
            discountPercent={translatedPackage.discountPercent}
            savingAmountText={translatedPackage.savingAmountText}
            featureGroups={[]}
            isBestSeller={translatedPackage.bestSeller}
            icon={getVoucherIcon(voucherPackage.voucherCount)}
            onSelect={() => handlePackageSelect(voucherPackage.id)}
          />
        )
      })}
    </div>
  )
}
