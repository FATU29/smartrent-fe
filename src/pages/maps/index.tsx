import React from 'react'
import { useTranslations } from 'next-intl'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { ListProvider } from '@/contexts/list/index.context'
import LocationProvider from '@/contexts/location'
import MapViewTemplate from '@/components/templates/mapView'

const MapsPage: NextPageWithLayout = () => {
  const t = useTranslations('navigation')

  return (
    <>
      <SeoHead title={t('maps')} description={t('maps')} canonical='/maps' />
      <MapViewTemplate />
    </>
  )
}

MapsPage.getLayout = (page) => {
  return (
    <LocationProvider>
      <ListProvider>
        <MainLayout>{page}</MainLayout>
      </ListProvider>
    </LocationProvider>
  )
}

export default MapsPage
