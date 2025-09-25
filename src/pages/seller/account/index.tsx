import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'

const AccountPage: NextPageWithLayout = () => {
  return (
    <>
      <SeoHead title='Tài khoản – Seller' noindex />
      <div className='p-4'>Account – {`coming soon`}</div>
    </>
  )
}

AccountPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default AccountPage
