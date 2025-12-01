import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import { ListingsManagementTemplate } from '@/components/templates/listingsManagementTemplate'
import { ListProvider } from '@/contexts/list/index.context'
import LocationProvider from '@/contexts/location'
import { ListingFilterRequest, ListingOwnerDetail } from '@/api/types'
import type { ApiResponse } from '@/configs/axios/types'
import { ListingService } from '@/api/services/listing.service'
import { mapMyListingsBackendToFrontend } from '@/utils/property/mapMyListingsResponse'

// Real fetcher using POST /v1/listings/my-listings
const fetchMyListings = async (
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
    listingStatus: filters.status as unknown as string,
  }

  const response = await ListingService.getMyListings(request)

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

const ListingsPage: NextPageWithLayout = () => {
  const t = useTranslations()

  return (
    <>
      <SeoHead title={t('userMenu.listings')} noindex />
      <LocationProvider>
        <ListProvider
          fetcher={fetchMyListings}
          initialData={[]}
          initialPagination={{
            currentPage: 0,
            pageSize: 20,
            totalCount: 0,
            totalPages: 0,
          }}
        >
          <ListingsManagementTemplate />
        </ListProvider>
      </LocationProvider>
    </>
  )
}

ListingsPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default ListingsPage
