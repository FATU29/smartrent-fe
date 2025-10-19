import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import CustomerManagementTemplate from '@/components/templates/customerManagementTemplate'

const CustomersPage: NextPageWithLayout = () => {
  return (
    <>
      <SeoHead title='Khách hàng – Seller' noindex />
      <div className='h-[calc(100vh-64px)]'>
        <CustomerManagementTemplate />
      </div>
    </>
  )
}

CustomersPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default CustomersPage
