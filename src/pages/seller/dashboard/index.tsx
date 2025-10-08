import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'

const Dashboard: NextPageWithLayout = () => {
  return (
    <>
      <SeoHead title='Bảng điều khiển – Seller' noindex />
      <div className='p-4'>Dashboard</div>
    </>
  )
}

Dashboard.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default Dashboard
