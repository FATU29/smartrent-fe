import React from 'react'
import { useTranslations } from 'next-intl'
import { MembershipHeader } from './MembershipHeader'
import { MembershipTabs } from './MembershipTabs'

interface MembershipRegisterTemplateProps {
  loading?: boolean
  onPlanSelect?: (planId: string) => void
  onVoucherSelect?: (packageId: string) => void
  defaultTab?: 'membership' | 'voucher'
}

export const MembershipRegisterTemplate: React.FC<
  MembershipRegisterTemplateProps
> = ({
  loading = false,
  onPlanSelect,
  onVoucherSelect,
  defaultTab = 'membership',
}) => {
  const t = useTranslations('membershipRegister')

  const handlePlanSelect = (planId: string) => {
    console.log('Selected membership plan:', planId)
    onPlanSelect?.(planId)
  }

  const handleVoucherSelect = (packageId: string) => {
    console.log('Selected voucher package:', packageId)
    onVoucherSelect?.(packageId)
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <MembershipHeader title={t('title')} subtitle={t('subtitle')} />

      <div className='mt-12'>
        <MembershipTabs
          loading={loading}
          onPlanSelect={handlePlanSelect}
          onVoucherSelect={handleVoucherSelect}
          defaultTab={defaultTab}
        />
      </div>
    </div>
  )
}

export default MembershipRegisterTemplate
