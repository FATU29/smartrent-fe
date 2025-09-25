import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'

const MembershipPage: NextPageWithLayout = () => {
  return (
    <>
      <SeoHead title='Gói thành viên – Seller' noindex />
      <div className='p-4'>Membership – {`coming soon`}</div>
    </>
  )
}

MembershipPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default MembershipPage
