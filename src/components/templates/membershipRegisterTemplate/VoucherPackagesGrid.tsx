import React, { useCallback } from 'react'
import VoucherPackageCard, {
  VoucherPackageCardSkeleton,
} from '@/components/molecules/voucherPackageCard'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import type { PushDetail } from '@/api/types/push.type'

interface VoucherPackagesGridProps {
  readonly loading?: boolean
  readonly vouchers?: readonly PushDetail[]
  readonly onPackageSelect?: (pushDetailId: number) => void
}

const SKELETON_COUNT = 3

export const VoucherPackagesGrid: React.FC<VoucherPackagesGridProps> = ({
  loading = false,
  vouchers = [],
  onPackageSelect,
}) => {
  const tPage = useTranslations('membershipPage')

  const handlePackageSelect = useCallback(
    (pushDetailId: number) => {
      onPackageSelect?.(pushDetailId)
    },
    [onPackageSelect],
  )

  if (loading) {
    return (
      <span className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <VoucherPackageCardSkeleton key={`skeleton-${index}`} />
        ))}
      </span>
    )
  }

  if (vouchers.length === 0) {
    return (
      <span className='flex items-center justify-center py-12'>
        <Typography variant='muted'>{tPage('noVouchersAvailable')}</Typography>
      </span>
    )
  }

  return (
    <span className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
      {vouchers.map((pkg) => (
        <VoucherPackageCard
          key={pkg.pushDetailId}
          pushDetail={pkg}
          onSelect={() => handlePackageSelect(pkg.pushDetailId)}
        />
      ))}
    </span>
  )
}
