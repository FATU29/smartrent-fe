import React, { useCallback, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { MembershipHeader } from './MembershipHeader'
import { MembershipTabs } from './MembershipTabs'
import type { Membership, PaymentProvider } from '@/api/types/memembership.type'
import type { PushDetail } from '@/api/types/push.type'
import { useQuery } from '@tanstack/react-query'
import { useDialog } from '@/hooks/useDialog'
import PaymentMethodDialog from '@/components/molecules/paymentMethodDialog'
import { MembershipService } from '@/api/services'
import { PushService } from '@/api/services/push.service'
import { useAuthContext } from '@/contexts/auth'

type TabValue = 'membership' | 'voucher'

interface MembershipRegisterTemplateProps {
  readonly memberships?: readonly Membership[]
  readonly vouchers?: readonly PushDetail[]
  readonly defaultTab?: TabValue
}

export const MembershipRegisterTemplate: React.FC<
  MembershipRegisterTemplateProps
> = ({ memberships = [], vouchers = [], defaultTab = 'membership' }) => {
  const tPage = useTranslations('membershipPage')

  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab)
  const [membershipId, setMembershipId] = useState<number | null>(null)
  const { user } = useAuthContext()

  const { open: openDialog, handleOpen, handleClose } = useDialog()

  const { data: voucherData, isFetching: loadingVouchers } = useQuery({
    queryKey: ['push-details'],
    enabled: activeTab === 'voucher',
    queryFn: async () => {
      const response = await PushService.getActivePushDetails()
      return response.data.data
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  })

  const membershipLoading = useMemo(() => {
    return memberships?.length === 0
  }, [memberships])

  const handleSelectMethod = useCallback(
    async (provider: PaymentProvider) => {
      if (!membershipId || !user?.userId) {
        return
      }
      const response = await MembershipService.purchaseMembership(
        {
          membershipId: membershipId,
          paymentProvider: provider,
          returnUrl: window.location.href,
        },
        user?.userId,
      )
      console.log('Purchase response:', response)

      handleClose()
    },
    [membershipId],
  )

  const handlePlanSelect = useCallback(async (membershipId: number) => {
    setMembershipId(membershipId)
    handleOpen()
  }, [])

  const handleVoucherSelect = useCallback((pushDetailId: number) => {
    console.log('Selected push detail ID:', pushDetailId)
  }, [])

  const handleChangeTab = useCallback((tab: TabValue) => {
    setActiveTab(tab)
  }, [])

  return (
    <>
      <div className='flex flex-col gap-8'>
        <MembershipHeader title={tPage('title')} subtitle={tPage('subtitle')} />

        <MembershipTabs
          loadingMemberships={membershipLoading}
          loadingVouchers={loadingVouchers}
          memberships={memberships}
          vouchers={voucherData ?? vouchers}
          onPlanSelect={handlePlanSelect}
          onVoucherSelect={handleVoucherSelect}
          defaultTab={defaultTab}
          onChangeTab={handleChangeTab}
        />
      </div>
      <PaymentMethodDialog
        open={openDialog}
        onOpenChange={handleClose}
        onSelectMethod={handleSelectMethod}
      />
    </>
  )
}

export default MembershipRegisterTemplate
