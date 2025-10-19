import React from 'react'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/atoms/tabs'
import { useTranslations } from 'next-intl'
import { MembershipPlansGrid } from './MembershipPlansGrid'
import { VoucherPackagesGrid } from './VoucherPackagesGrid'
import type { Membership } from '@/api/types/memembership.type'
import type { PushDetail } from '@/api/types/push.type'

type TabValue = 'membership' | 'voucher'

interface MembershipTabsProps {
  readonly loadingMemberships?: boolean
  readonly loadingVouchers?: boolean
  readonly memberships?: readonly Membership[]
  readonly vouchers?: readonly PushDetail[]
  readonly onPlanSelect?: (membershipId: number) => void
  readonly onVoucherSelect?: (pushDetailId: number) => void
  readonly onChangeTab?: (tab: TabValue) => void
  readonly defaultTab?: TabValue
}

export const MembershipTabs: React.FC<MembershipTabsProps> = ({
  loadingMemberships = false,
  loadingVouchers = false,
  memberships = [],
  vouchers = [],
  onPlanSelect,
  onVoucherSelect,
  defaultTab = 'membership',
  onChangeTab,
}) => {
  const tPage = useTranslations('membershipPage')

  return (
    <Tabs
      defaultValue={defaultTab}
      className='w-full'
      aria-label={tPage('aria.register')}
      onValueChange={(value) => onChangeTab?.(value as TabValue)}
    >
      <TabsList className='flex-wrap rounded-lg border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40'>
        <TabsTrigger
          value='membership'
          aria-label={tPage('aria.membershipTab')}
          className='data-[state=active]:bg-primary/10'
        >
          {tPage('tabs.membership')}
        </TabsTrigger>
        <TabsTrigger
          value='voucher'
          aria-label={tPage('aria.voucherTab')}
          className='data-[state=active]:bg-primary/10'
        >
          {tPage('tabs.voucher')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value='membership' className='mt-6'>
        <MembershipPlansGrid
          loading={loadingMemberships}
          memberships={memberships}
          onPlanSelect={onPlanSelect}
        />
      </TabsContent>

      <TabsContent value='voucher' className='mt-6'>
        <VoucherPackagesGrid
          loading={loadingVouchers}
          vouchers={vouchers}
          onPackageSelect={onVoucherSelect}
        />
      </TabsContent>
    </Tabs>
  )
}
