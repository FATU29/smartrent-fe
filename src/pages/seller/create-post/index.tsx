import type { NextPageWithLayout } from '@/types/next-page'
import { CreatePostTemplate } from '@/components/templates/createPostTemplate'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'

const CreatePostPage: NextPageWithLayout = () => {
  return (
    <>
      <SeoHead title='Đăng tin – Seller' noindex />
      <CreatePostTemplate />
    </>
  )
}

CreatePostPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default CreatePostPage
