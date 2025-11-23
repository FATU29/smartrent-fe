import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import { ListingsManagementTemplate } from '@/components/templates/listingsManagementTemplate'
import { List } from '@/contexts/list'
import LocationProvider from '@/contexts/location'
import { useCallback } from 'react'
import { MOCK_LISTINGS } from '@/mock/ownerListing'

const ListingsPage: NextPageWithLayout = () => {
  const t = useTranslations()

  const listingsFetcher = useCallback(async () => {
    console.log('Simple fetcher called')
    return {
      data: MOCK_LISTINGS,
      total: MOCK_LISTINGS.length,
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    }
  }, [])

  return (
    <>
      <SeoHead title={t('userMenu.listings')} noindex />
      <LocationProvider>
        <List.Provider fetcher={listingsFetcher} defaultPerPage={5}>
          <ListingsManagementTemplate />
        </List.Provider>
      </LocationProvider>
    </>
  )
}

ListingsPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default ListingsPage
