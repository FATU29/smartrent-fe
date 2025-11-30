import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import { ListingsManagementTemplate } from '@/components/templates/listingsManagementTemplate'
import { List } from '@/contexts/list'
import LocationProvider from '@/contexts/location'
import {
  ListingFilterRequest,
  ListingOwnerDetail,
  ListingSearchResponse,
} from '@/api/types'
import { ApiResponse } from '@/configs/axios/types'
import mockListingsData from '@/mock/listings'

// Mock fetcher function that simulates API call
const mockListingsFetcher = async (
  filters: ListingFilterRequest,
): Promise<ApiResponse<ListingSearchResponse<ListingOwnerDetail>>> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Filter listings based on status
  let filteredListings = [...mockListingsData.listingOwnerDetails]

  if (filters.status) {
    filteredListings = filteredListings.filter(
      (listing) => listing.status === filters.status,
    )
  }

  // Filter by keyword
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    filteredListings = filteredListings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(keyword) ||
        listing.description.toLowerCase().includes(keyword),
    )
  }

  // Apply pagination
  const page = filters.page || 1
  const size = filters.size || 10
  const startIndex = (page - 1) * size
  const endIndex = startIndex + size
  const paginatedListings = filteredListings.slice(startIndex, endIndex)

  return {
    code: '999999',
    message: 'Success',
    success: true,
    data: {
      listings: paginatedListings,
      pagination: {
        currentPage: page,
        pageSize: size,
        totalCount: filteredListings.length,
        totalPages: Math.ceil(filteredListings.length / size),
      },
    },
  }
}

const ListingsPage: NextPageWithLayout = () => {
  const t = useTranslations()

  return (
    <>
      <SeoHead title={t('userMenu.listings')} noindex />
      <LocationProvider>
        <List.Provider
          fetcher={mockListingsFetcher}
          initialData={mockListingsData.listingOwnerDetails}
          initialPagination={{
            currentPage: 1,
            pageSize: 10,
            totalCount: mockListingsData.listingOwnerDetails.length,
            totalPages: Math.ceil(
              mockListingsData.listingOwnerDetails.length / 10,
            ),
          }}
        >
          <ListingsManagementTemplate />
        </List.Provider>
      </LocationProvider>
    </>
  )
}

ListingsPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default ListingsPage
