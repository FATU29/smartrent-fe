import React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import MainLayout from '@/components/layouts/homePageLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import PolicyTemplate from '@/components/templates/policyTemplate'

const ListingRulesPage: NextPageWithLayout = () => {
  const t = useTranslations('policies')

  return (
    <>
      <SeoHead
        title={t('listingRules.title')}
        description={t('listingRules.seoDescription')}
      />
      <PolicyTemplate policyKey='listingRules' />
    </>
  )
}

ListingRulesPage.getLayout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
)

export default ListingRulesPage
