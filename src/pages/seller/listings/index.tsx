import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import { ListingsManagementTemplate } from '@/components/templates/listingsManagementTemplate'

const ListingsPage: NextPageWithLayout = () => {
  const t = useTranslations()

  return (
    <>
      <SeoHead title={t('userMenu.listings')} noindex />
      <ListingsManagementTemplate />
    </>
  )
}

ListingsPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default ListingsPage
