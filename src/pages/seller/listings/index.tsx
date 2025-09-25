import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'

const ListingsPage: NextPageWithLayout = () => {
  return (
    <>
      <SeoHead title='Tin đăng – Seller' noindex />
      <div className='p-4'>Listings – {`coming soon`}</div>
    </>
  )
}

ListingsPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default ListingsPage
