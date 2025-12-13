import React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import DashboardTemplate from '@/components/templates/dashboardTemplate'

const Dashboard: NextPageWithLayout = () => {
  const t = useTranslations('seller.dashboard')

  return (
    <>
      <SeoHead
        title={t('seoTitle')}
        description={t('seoDescription')}
        noindex
      />
      <DashboardTemplate />
    </>
  )
}

Dashboard.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default Dashboard
