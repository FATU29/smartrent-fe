import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import ResidentialPropertiesCursorTemplate from '@/components/templates/residentialPropertiesCursor'
import { ListProvider } from '@/contexts/list/index.context'
import LocationProvider from '@/contexts/location'
import { getFiltersFromQuery } from '@/utils/queryParams'
import { ListingFilterRequest } from '@/api/types/property.type'

/**
 * Cursor (load-more) variant of the properties listing page. Intentionally
 * isolated from the offset `/properties` page: it mounts {@link ListProvider}
 * WITHOUT a fetcher purely to host the shared filter bar's state, while the
 * listing column pages through the keyset cursor endpoint. No shared context
 * code is touched, so the numbered-pagination experience is unaffected.
 */
const ResidentialPropertiesCursorPage: NextPageWithLayout = () => {
  const t = useTranslations('navigation')
  const router = useRouter()
  const [initialFilters, setInitialFilters] =
    useState<Partial<ListingFilterRequest> | null>(null)

  useEffect(() => {
    if (!router.isReady || initialFilters) {
      return
    }
    setInitialFilters(getFiltersFromQuery(router.query))
  }, [router.isReady, router.query, initialFilters])

  if (!initialFilters) {
    return (
      <>
        <SeoHead title={t('properties')} description='Property search' />
        <div className='container max-w-6xl mx-auto px-4 py-6 lg:py-8'>
          <div className='min-h-[320px]' aria-busy='true' />
        </div>
      </>
    )
  }

  return (
    <>
      <SeoHead title={t('properties')} description='Property search' />
      <div className='container max-w-6xl mx-auto px-4 py-6 lg:py-8'>
        {/* No `fetcher` → the offset list flow never runs; this provider only
            holds filter state for the shared filter bar/sidebar. */}
        <ListProvider initialData={[]} initialFilters={initialFilters}>
          <LocationProvider>
            <ResidentialPropertiesCursorTemplate />
          </LocationProvider>
        </ListProvider>
      </div>
    </>
  )
}

ResidentialPropertiesCursorPage.getLayout = function getLayout(
  page: React.ReactNode,
) {
  return <MainLayout activeItem='properties'>{page}</MainLayout>
}

export default ResidentialPropertiesCursorPage
