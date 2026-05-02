import React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import PricingGuideTemplate from '@/components/templates/pricingGuideTemplate'

const PricingGuidePage: NextPageWithLayout = () => {
  const t = useTranslations('guides.pricing')

  return (
    <>
      <SeoHead title={t('title')} description={t('description')} />
      <PricingGuideTemplate />
    </>
  )
}

export default PricingGuidePage

PricingGuidePage.getLayout = (page: React.ReactNode) => (
  <SellerLayout>{page}</SellerLayout>
)
