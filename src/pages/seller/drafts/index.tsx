import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import { DraftsTemplate } from '@/components/templates/draftsTemplate'
import { ListProvider } from '@/contexts/list/index.context'
import { ListingService } from '@/api/services'
import { mapMyListingsBackendToFrontend } from '@/utils/property/mapMyListingsResponse'
import type { ApiResponse } from '@/configs/axios/types'
import type { ListingFilterRequest, ListingOwnerDetail } from '@/api/types'

// Fetcher for drafts using POST /v1/listings/my-drafts
const fetchMyDrafts = async (
  filters: ListingFilterRequest,
): Promise<
  ApiResponse<{
    listings: ListingOwnerDetail[]
    pagination: {
      totalCount: number
      currentPage: number
      pageSize: number
      totalPages: number
    }
  }>
> => {
  const request = {
    ...filters,
    isDraft: true,
  }

  const response = await ListingService.getMyDrafts(request)

  if (!response.success || !response.data) {
    return {
      code: response.code,
      message: response.message,
      success: false,
      data: {
        listings: [],
        pagination: {
          totalCount: 0,
          currentPage: filters.page || 0,
          pageSize: filters.size || 20,
          totalPages: 0,
        },
      },
    }
  }

  const frontend = mapMyListingsBackendToFrontend(response.data)

  return {
    code: response.code,
    message: response.message,
    success: true,
    data: frontend,
  }
}

const DraftsPage: NextPageWithLayout = () => {
  const t = useTranslations('seller.drafts')

  return (
    <>
      <SeoHead title={t('title')} noindex />
      <ListProvider
        fetcher={fetchMyDrafts}
        initialData={[]}
        initialPagination={{
          currentPage: 0,
          pageSize: 20,
          totalCount: 0,
          totalPages: 0,
        }}
      >
        <DraftsTemplate />
      </ListProvider>
    </>
  )
}

DraftsPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default DraftsPage
