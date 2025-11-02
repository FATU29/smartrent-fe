import React, { useCallback, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { MembershipHeader } from './MembershipHeader'
import { MembershipPlansGrid } from './MembershipPlansGrid'
import type { Membership, PaymentProvider } from '@/api/types/memembership.type'
import { useDialog } from '@/hooks/useDialog'
import PaymentMethodDialog from '@/components/molecules/paymentMethodDialog'
import { MembershipService } from '@/api/services'
import { useAuthContext } from '@/contexts/auth'

interface MembershipRegisterTemplateProps {
  readonly memberships?: readonly Membership[]
}

export const MembershipRegisterTemplate: React.FC<
  MembershipRegisterTemplateProps
> = ({ memberships = [] }) => {
  const tPage = useTranslations('membershipPage')

  const [membershipId, setMembershipId] = useState<number | null>(null)
  const { user } = useAuthContext()

  const { open: openDialog, handleOpen, handleClose } = useDialog()

  const membershipLoading = useMemo(() => {
    return memberships?.length === 0
  }, [memberships])

  const handleSelectMethod = useCallback(
    async (provider: PaymentProvider) => {
      if (!membershipId || !user?.userId) {
        return
      }

      try {
        const response = await MembershipService.purchaseMembership(
          {
            membershipId: membershipId,
            paymentProvider: provider,
            returnUrl: window.location.href,
          },
          user?.userId,
        )

        // Redirect to payment URL if available
        if (response.data?.paymentUrl) {
          window.location.href = response.data.paymentUrl
        }

        handleClose()
      } catch (error) {
        console.error('Purchase failed:', error)
        // Handle error (show toast, etc.)
      }
    },
    [membershipId, user?.userId, handleClose],
  )

  const handlePlanSelect = useCallback(async (membershipId: number) => {
    setMembershipId(membershipId)
    handleOpen()
  }, [])

  return (
    <>
      <div className='flex flex-col gap-8'>
        <MembershipHeader title={tPage('title')} subtitle={tPage('subtitle')} />

        <MembershipPlansGrid
          loading={membershipLoading}
          memberships={memberships}
          onPlanSelect={handlePlanSelect}
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
