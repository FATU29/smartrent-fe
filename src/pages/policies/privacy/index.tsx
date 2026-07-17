import React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import MainLayout from '@/components/layouts/homePageLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import PolicyTemplate from '@/components/templates/policyTemplate'

const PrivacyPage: NextPageWithLayout = () => {
  const t = useTranslations('policies')

  return (
    <>
      <SeoHead
        title={t('privacy.title')}
        description={t('privacy.seoDescription')}
      />
      <PolicyTemplate policyKey='privacy' />
    </>
  )
}

PrivacyPage.getLayout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
)

export default PrivacyPage
