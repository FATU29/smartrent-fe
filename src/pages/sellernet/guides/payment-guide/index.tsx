import React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import SellernetLayout from '@/components/layouts/sellernet/SellernetLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import PaymentGuideTemplate from '@/components/templates/paymentGuideTemplate'

const PaymentGuidePage: NextPageWithLayout = () => {
  const t = useTranslations('guides.payment')

  return (
    <>
      <SeoHead title={t('title')} description={t('description')} />
      <PaymentGuideTemplate />
    </>
  )
}

PaymentGuidePage.getLayout = (page: React.ReactNode) => (
  <SellernetLayout>{page}</SellernetLayout>
)

export default PaymentGuidePage
