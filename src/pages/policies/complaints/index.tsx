import React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import MainLayout from '@/components/layouts/homePageLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import PolicyTemplate from '@/components/templates/policyTemplate'

const ComplaintsPage: NextPageWithLayout = () => {
  const t = useTranslations('policies')

  return (
    <>
      <SeoHead
        title={t('complaints.title')}
        description={t('complaints.seoDescription')}
      />
      <PolicyTemplate policyKey='complaints' />
    </>
  )
}

ComplaintsPage.getLayout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
)

export default ComplaintsPage
