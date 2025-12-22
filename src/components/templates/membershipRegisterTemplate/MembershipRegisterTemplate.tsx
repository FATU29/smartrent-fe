import React, { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { MembershipHeader } from './MembershipHeader'
import { MembershipPlansGrid } from './MembershipPlansGrid'
import type { PaymentProvider, Membership } from '@/api/types/membership.type'
import { useDialog } from '@/hooks/useDialog'
import PaymentMethodDialog from '@/components/molecules/paymentMethodDialog'
import { useAuthContext } from '@/contexts/auth'
import {
  useMembershipPackages,
  usePurchaseMembership,
} from '@/hooks/useMembership'
import { toast } from 'sonner'

export const MembershipRegisterTemplate: React.FC = () => {
  const tPage = useTranslations('membershipPage')

  const [membershipId, setMembershipId] = useState<number | null>(null)
  const { user } = useAuthContext()

  const { open: openDialog, handleOpen, handleClose } = useDialog()

  const {
    data: memberships = [],
    isLoading: membershipLoading,
    error: membershipError,
  } = useMembershipPackages()

  const purchaseMutation = usePurchaseMembership()

  const handleSelectMethod = useCallback(
    async (provider: PaymentProvider) => {
      if (!membershipId || !user?.userId) {
        toast.error(tPage('errors.loginRequired'))
        return
      }

      try {
        // Find the selected membership details
        const selectedMembership = memberships.find(
          (m: Membership) => m.membershipId === membershipId,
        )

        // Clear any previous payment session storage
        sessionStorage.removeItem('pendingListingCreation')

        // Store membership info in session storage before redirect
        if (selectedMembership) {
          sessionStorage.setItem(
            'pendingMembership',
            JSON.stringify({
              membershipId: selectedMembership.membershipId,
              packageName: selectedMembership.packageName,
              packageLevel: selectedMembership.packageLevel,
              salePrice: selectedMembership.salePrice,
              originalPrice: selectedMembership.originalPrice,
              durationMonths: selectedMembership.durationMonths,
              discountPercentage: selectedMembership.discountPercentage,
              benefits: selectedMembership.benefits,
            }),
          )
        }

        const result = await purchaseMutation.mutateAsync({
          request: {
            membershipId: membershipId,
            paymentProvider: provider,
          },
          userId: user.userId,
        })

        // Redirect to payment URL if available
        // Backend will handle callback and redirect to configured frontend URL
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl
        } else {
          toast.success(tPage('success.purchaseSuccess'))
        }

        handleClose()
      } catch (error) {
        console.error('Purchase failed:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : tPage('errors.purchaseFailed'),
        )
      }
    },
    [
      membershipId,
      user?.userId,
      handleClose,
      purchaseMutation,
      tPage,
      memberships,
    ],
  )

  const handlePlanSelect = useCallback(
    async (membershipId: number) => {
      setMembershipId(membershipId)
      handleOpen()
    },
    [handleOpen],
  )

  if (membershipError) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-destructive'>
          {membershipError instanceof Error
            ? membershipError.message
            : tPage('errors.loadFailed')}
        </p>
      </div>
    )
  }

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
