import React from 'react'
import { useRouter } from 'next/router'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import type { NextPageWithLayout } from '@/types/next-page'
import MainLayout from '@/components/layouts/homePageLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import SellerPublicDetailTemplate from '@/components/templates/sellerPublicDetailTemplate'
import { ListingDetail, SortKey, UserApi, VipType } from '@/api/types'
import { ListingService } from '@/api/services/listing.service'
import { mapBackendToFrontendResponse } from '@/utils/property/mapListingResponse'

interface SellerVipSectionQueryData {
  vipType: VipType
  seller: UserApi | null
  listings: ListingDetail[]
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize: number
}

const DEFAULT_PAGE_SIZE = 12
const PAGE_SIZE_OPTIONS = ['6', '12', '24']
const VIP_SECTION_ORDER: VipType[] = ['DIAMOND', 'GOLD', 'SILVER', 'NORMAL']

const SELLER_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
}

const SellerDetailPage: NextPageWithLayout = () => {
  const t = useTranslations('sellerDetailPage')
  const router = useRouter()

  const userId = React.useMemo(() => {
    const routeValue = router.query.userId
    if (!routeValue) return ''
    return Array.isArray(routeValue) ? routeValue[0] || '' : routeValue
  }, [router.query.userId])

  const [sectionPaging, setSectionPaging] = React.useState<
    Record<VipType, { page: number; size: number }>
  >({
    DIAMOND: { page: 1, size: DEFAULT_PAGE_SIZE },
    GOLD: { page: 1, size: DEFAULT_PAGE_SIZE },
    SILVER: { page: 1, size: DEFAULT_PAGE_SIZE },
    NORMAL: { page: 1, size: DEFAULT_PAGE_SIZE },
  })

  React.useEffect(() => {
    setSectionPaging({
      DIAMOND: { page: 1, size: DEFAULT_PAGE_SIZE },
      GOLD: { page: 1, size: DEFAULT_PAGE_SIZE },
      SILVER: { page: 1, size: DEFAULT_PAGE_SIZE },
      NORMAL: { page: 1, size: DEFAULT_PAGE_SIZE },
    })
  }, [userId])

  const sectionQueries = useQueries({
    queries: VIP_SECTION_ORDER.map((vipType) => {
      const paging = sectionPaging[vipType]

      return {
        queryKey: [
          'public-seller-detail',
          userId,
          vipType,
          paging.page,
          paging.size,
        ],
        queryFn: async (): Promise<SellerVipSectionQueryData> => {
          const response =
            vipType === 'DIAMOND'
              ? await ListingService.getSellerDiamondListings(
                  userId,
                  paging.page,
                  paging.size,
                  SortKey.NEWEST,
                )
              : vipType === 'GOLD'
                ? await ListingService.getSellerGoldListings(
                    userId,
                    paging.page,
                    paging.size,
                    SortKey.NEWEST,
                  )
                : vipType === 'SILVER'
                  ? await ListingService.getSellerSilverListings(
                      userId,
                      paging.page,
                      paging.size,
                      SortKey.NEWEST,
                    )
                  : await ListingService.getSellerNormalListings(
                      userId,
                      paging.page,
                      paging.size,
                      SortKey.NEWEST,
                    )

          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to fetch seller detail')
          }

          const mapped = mapBackendToFrontendResponse(response.data)
          const listings = mapped.listings || []
          const seller =
            listings.find((item) => item.user?.userId === userId)?.user ||
            listings[0]?.user ||
            null

          return {
            vipType,
            seller,
            listings,
            totalCount: mapped.pagination.totalCount || 0,
            currentPage: mapped.pagination.currentPage || paging.page,
            totalPages:
              mapped.pagination.totalPages ||
              Math.max(
                1,
                Math.ceil((mapped.pagination.totalCount || 0) / paging.size),
              ),
            pageSize: mapped.pagination.pageSize || paging.size,
          }
        },
        enabled: Boolean(userId),
        placeholderData: (
          previousData: SellerVipSectionQueryData | undefined,
        ) => previousData,
        ...SELLER_QUERY_CONFIG,
      }
    }),
  })

  const { data: sellerProfileData, refetch: refetchSellerProfile } = useQuery({
    queryKey: ['public-seller-profile', userId],
    queryFn: async () => {
      const response = await ListingService.search({
        userId,
        page: 1,
        size: 1,
        sortBy: SortKey.NEWEST,
      })

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch seller profile')
      }

      const mapped = mapBackendToFrontendResponse(response.data)
      return mapped.listings?.[0]?.user || null
    },
    enabled: Boolean(userId),
    retry: 1,
    ...SELLER_QUERY_CONFIG,
  })

  const {
    data: topSavedData,
    isLoading: isTopSavedLoading,
    isError: isTopSavedError,
    refetch: refetchTopSaved,
  } = useQuery({
    queryKey: ['public-seller-top-saved', userId],
    queryFn: async () => {
      const response = await ListingService.getSellerTopSavedListings(userId, 5)

      if (!response.success || !response.data) {
        throw new Error(
          response.message || 'Failed to fetch seller top saved listings',
        )
      }

      const mapped = mapBackendToFrontendResponse(response.data)
      return mapped.listings || []
    },
    enabled: Boolean(userId),
    retry: 1,
    ...SELLER_QUERY_CONFIG,
  })

  const sectionMap = React.useMemo(() => {
    return VIP_SECTION_ORDER.reduce(
      (acc, vipType, index) => {
        acc[vipType] = sectionQueries[index]
        return acc
      },
      {} as Record<VipType, (typeof sectionQueries)[number]>,
    )
  }, [sectionQueries])

  const seller = React.useMemo(() => {
    return (
      VIP_SECTION_ORDER.map(
        (vipType) => sectionMap[vipType]?.data?.seller,
      ).find(Boolean) ||
      sellerProfileData ||
      null
    )
  }, [sectionMap, sellerProfileData])

  const sectionStats = React.useMemo(() => {
    return VIP_SECTION_ORDER.map((vipType) => {
      const query = sectionMap[vipType]
      const data = query?.data
      const paging = sectionPaging[vipType]

      return {
        vipType,
        listings: data?.listings || [],
        listingCount: data?.totalCount || 0,
        currentPage: data?.currentPage || paging.page,
        totalPages: data?.totalPages || 1,
        pageSize: data?.pageSize || paging.size,
        isLoading: Boolean(query?.isLoading),
        isError: Boolean(query?.isError),
        onRetry: () => query?.refetch(),
        onPageChange: (page: number) => {
          setSectionPaging((previous) => ({
            ...previous,
            [vipType]: {
              ...previous[vipType],
              page,
            },
          }))
        },
        onPageSizeChange: (size: string) => {
          const nextSize = Number(size)
          if (!Number.isInteger(nextSize) || nextSize <= 0) return

          setSectionPaging((previous) => ({
            ...previous,
            [vipType]: {
              page: 1,
              size: nextSize,
            },
          }))
        },
      }
    })
  }, [sectionMap, sectionPaging])

  const totalListingCount = React.useMemo(
    () => sectionStats.reduce((sum, item) => sum + item.listingCount, 0),
    [sectionStats],
  )

  const isLoading = sectionStats.every((item) => item.isLoading)
  const isError = sectionStats.every((item) => item.isError)

  const handleRetryAll = React.useCallback(() => {
    sectionQueries.forEach((query) => {
      void query.refetch()
    })
    void refetchSellerProfile()
    void refetchTopSaved()
  }, [refetchSellerProfile, refetchTopSaved, sectionQueries])

  const sellerName = React.useMemo(() => {
    if (!seller) return t('profile.defaultSellerName')
    return `${seller.firstName || ''} ${seller.lastName || ''}`.trim()
  }, [seller, t])

  return (
    <>
      <SeoHead
        title={`${t('seo.title', { name: sellerName })} – SmartRent`}
        description={t('seo.description', { name: sellerName })}
      />

      <SellerPublicDetailTemplate
        seller={seller}
        listingCount={totalListingCount}
        sections={sectionStats}
        topSavedListings={topSavedData || []}
        isTopSavedLoading={isTopSavedLoading}
        isTopSavedError={isTopSavedError}
        onRetryTopSaved={() => refetchTopSaved()}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        isLoading={isLoading}
        isError={isError}
        onRetryAll={handleRetryAll}
      />
    </>
  )
}

SellerDetailPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout activeItem='properties'>{page}</MainLayout>
}

export default SellerDetailPage
