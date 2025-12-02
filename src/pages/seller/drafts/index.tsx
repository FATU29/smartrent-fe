import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import { DraftsTemplate } from '@/components/templates/draftsTemplate'
import { useGetMyDrafts } from '@/hooks/useListings/useGetMyDrafts'

const DraftsPage: NextPageWithLayout = () => {
  const t = useTranslations('seller.drafts')
  const { data: drafts = [], isLoading } = useGetMyDrafts()

  return (
    <>
      <SeoHead title={t('title')} noindex />
      <DraftsTemplate drafts={drafts} isLoading={isLoading} />
    </>
  )
}

DraftsPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default DraftsPage
