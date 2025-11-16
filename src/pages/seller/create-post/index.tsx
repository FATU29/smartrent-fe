import type { NextPageWithLayout } from '@/types/next-page'
import { CreatePostTemplate } from '@/components/templates/createPostTemplate'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import LocationProvider from '@/contexts/location'
import { CreatePostProvider } from '@/contexts/createPost'
import { CreatePostDraftGuard } from '@/components/molecules/createPostDraftGuard'

const CreatePostPage: NextPageWithLayout = () => {
  return (
    <>
      <SeoHead title='Đăng tin – Seller' noindex />
      <LocationProvider>
        <CreatePostProvider>
          <CreatePostDraftGuard>
            <CreatePostTemplate />
          </CreatePostDraftGuard>
        </CreatePostProvider>
      </LocationProvider>
    </>
  )
}

CreatePostPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default CreatePostPage
