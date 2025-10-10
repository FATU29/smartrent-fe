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

interface MembershipTabsProps {
  loading?: boolean
  onPlanSelect?: (planId: string) => void
  onVoucherSelect?: (packageId: string) => void
  defaultTab?: 'membership' | 'voucher'
}

export const MembershipTabs: React.FC<MembershipTabsProps> = ({
  loading = false,
  onPlanSelect,
  onVoucherSelect,
  defaultTab = 'membership',
}) => {
  const t = useTranslations('membershipRegister')

  return (
    <Tabs defaultValue={defaultTab} className='w-full'>
      <TabsList className='grid w-full grid-cols-2 mb-8'>
        <TabsTrigger value='membership' className='text-sm font-medium'>
          {t('tabs.membership')}
        </TabsTrigger>
        <TabsTrigger value='voucher' className='text-sm font-medium'>
          {t('tabs.voucher')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value='membership' className='mt-0'>
        <MembershipPlansGrid loading={loading} onPlanSelect={onPlanSelect} />
      </TabsContent>

      <TabsContent value='voucher' className='mt-0'>
        <VoucherPackagesGrid
          loading={loading}
          onPackageSelect={onVoucherSelect}
        />
      </TabsContent>
    </Tabs>
  )
}
