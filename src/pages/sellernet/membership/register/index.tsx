import React, { useMemo } from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import MembershipRegisterTemplate from '@/components/templates/membershipRegisterTemplate'
import { useTranslations } from 'next-intl'

const MembershipRegisterPage: NextPageWithLayout = () => {
  const tPage = useTranslations('membershipPage')

  const pageTitle = useMemo(() => `${tPage('title')} – Sellernet`, [tPage])

  return (
    <>
      <SeoHead title={pageTitle} />
      <MembershipRegisterTemplate />
    </>
  )
}

export default MembershipRegisterPage

MembershipRegisterPage.getLayout = (page: React.ReactNode) => (
  <SellerLayout>{page}</SellerLayout>
)
