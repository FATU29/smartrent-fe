'use client'

import { NextPageWithLayout } from '@/types/next-page'
import MainLayout from '@/components/layouts/homePageLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import CompareTemplate from '@/components/templates/compareTemplate'

/**
 * Compare Listings Page
 * Displays a comparison table of up to 3 listings
 * Client-side only - uses Zustand store with localStorage persistence
 */
const ComparePage: NextPageWithLayout = () => {
  const t = useTranslations('compare')

  return (
    <>
      <SeoHead
        title={`${t('title')} – SmartRent`}
        description={t('subtitle')}
        openGraph={{
          type: 'website',
        }}
      />
      <CompareTemplate />
    </>
  )
}

ComparePage.getLayout = (page) => (
  <MainLayout activeItem='compare'>{page}</MainLayout>
)

export default ComparePage
