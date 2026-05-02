import React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import UsageGuideTemplate from '@/components/templates/usageGuideTemplate'

const UsageGuidePage: NextPageWithLayout = () => {
  const t = useTranslations('guides.usage')

  return (
    <>
      <SeoHead title={t('title')} description={t('description')} />
      <UsageGuideTemplate />
    </>
  )
}

UsageGuidePage.getLayout = (page: React.ReactNode) => (
  <SellerLayout>{page}</SellerLayout>
)

export default UsageGuidePage
