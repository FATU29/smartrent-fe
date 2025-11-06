import React from 'react'
import MainLayout from '@/components/layouts/MainLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import ResidentialPropertiesTemplate from '@/components/templates/residentialProperties'
import { ListProvider } from '@/contexts/list/index.context'
import { fetchListings, getInitial } from '@/api/services'
import { PropertyCard } from '@/api/types/property.type'
import { GetStaticProps, GetStaticPaths } from 'next'
import LocationProvider from '@/contexts/location'

interface ResidentialPropertiesPageProps {
  initialData: PropertyCard[]
}

const ResidentialPropertiesPage: NextPageWithLayout<
  ResidentialPropertiesPageProps
> = ({ initialData }) => {
  const t = useTranslations('navigation')

  return (
    <>
      <SeoHead
        title={t('residential')}
        description='Residential property search'
      />
      <div className='container mx-auto py-6 px-4 md:px-0'>
        <ListProvider fetcher={fetchListings} initialData={initialData}>
          <LocationProvider>
            <ResidentialPropertiesTemplate />
          </LocationProvider>
        </ListProvider>
      </div>
    </>
  )
}

ResidentialPropertiesPage.getLayout = function getLayout(
  page: React.ReactNode,
) {
  return <MainLayout activeItem='properties'>{page}</MainLayout>
}

export default ResidentialPropertiesPage

export const getStaticPaths: GetStaticPaths = async () => {
  // Return empty paths array with blocking fallback to accept all paths dynamically
  return {
    paths: [],
    fallback: 'blocking', // All paths will be generated on-demand
  }
}

export const getStaticProps: GetStaticProps = async () => {
  const initialData = await getInitial()
  return { props: { initialData } }
}
