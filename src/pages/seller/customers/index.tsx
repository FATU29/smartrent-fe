import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'

const CustomersPage: NextPageWithLayout = () => {
  return (
    <>
      <SeoHead title='Khách hàng – Seller' noindex />
      <div className='p-4'>Customers – {`coming soon`}</div>
    </>
  )
}

CustomersPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default CustomersPage
