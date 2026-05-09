import React from 'react'
import { useTranslations } from 'next-intl'
import type { NextPageWithLayout } from '@/types/next-page'
import MainLayout from '@/components/layouts/homePageLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import FollowingPageTemplate from '@/components/templates/followingPageTemplate'

/**
 * /following — auth-required page where the viewer manages users they follow
 * (with unfollow buttons) and browses a feed of those users' new listings.
 * Auth gating happens at the middleware level (see src/middleware.ts).
 */
const FollowingPage: NextPageWithLayout = () => {
  const t = useTranslations('followingPage')

  return (
    <>
      <SeoHead
        title={`${t('title')} – SmartRent`}
        description={t('subtitle')}
      />
      <FollowingPageTemplate />
    </>
  )
}

FollowingPage.getLayout = (page) => (
  <MainLayout activeItem='following'>{page}</MainLayout>
)

export default FollowingPage
