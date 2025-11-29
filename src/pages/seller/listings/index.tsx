import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import { ListingsManagementTemplate } from '@/components/templates/listingsManagementTemplate'
import { List } from '@/contexts/list'
import LocationProvider from '@/contexts/location'

const ListingsPage: NextPageWithLayout = () => {
  const t = useTranslations()

  return (
    <>
      <SeoHead title={t('userMenu.listings')} noindex />
      <LocationProvider>
        <List.Provider>
          <ListingsManagementTemplate />
        </List.Provider>
      </LocationProvider>
    </>
  )
}

ListingsPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default ListingsPage
