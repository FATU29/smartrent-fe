import React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import SellernetLayout from '@/components/layouts/sellernet/SellernetLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import MembershipRegisterTemplate from '@/components/templates/membershipRegisterTemplate'
import { useTranslations } from 'next-intl'

const MembershipRegisterPage: NextPageWithLayout = () => {
  const loading = false // future: fetch state
  const tPage = useTranslations('membershipPage')

  const handlePlanSelect = (planId: string) => {
    // Handle membership plan selection
    console.log('Selected membership plan:', planId)
    // TODO: Navigate to payment or perform other actions
  }

  const handleVoucherSelect = (packageId: string) => {
    // Handle voucher package selection
    console.log('Selected voucher package:', packageId)
    // TODO: Navigate to payment or perform other actions
  }

  return (
    <>
      <SeoHead title={tPage('title') + ' – Sellernet'} noindex />
      <MembershipRegisterTemplate
        loading={loading}
        onPlanSelect={handlePlanSelect}
        onVoucherSelect={handleVoucherSelect}
        defaultTab='membership'
      />
    </>
  )
}

export default MembershipRegisterPage

MembershipRegisterPage.getLayout = (page: React.ReactNode) => (
  <SellernetLayout>{page}</SellernetLayout>
)
