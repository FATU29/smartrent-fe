import React, { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  ListingStatus,
  ListingStatusFilterResponsive,
} from '@/components/molecules/listings/ListingStatusFilterResponsive'
import { ListingEmptyState } from '@/components/organisms/listings/ListingEmptyState'
import { ListingToolbar } from '@/components/molecules/listings/ListingToolbar'
import { ListingFilterDialog } from '@/components/molecules/listingFilterDialog'
import { ListingsList } from '@/components/organisms/listings-list'
import { MOCK_LISTINGS } from './index.constants'
import { Property } from '@/api/types/property.type'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { List, useListContext } from '@/contexts/list'

const ListingsWithPagination: React.FC<{ currentStatus: ListingStatus }> = ({
  currentStatus,
}) => {
  const {
    itemsData: listings,
    isLoading,
    pagination,
    handleLoadMore,
  } = useListContext<Property>()
  const isMobile = useIsMobile()
  const t = useTranslations('common')
  const tSeller = useTranslations('seller.listingManagement')

  console.log('ListingsWithPagination rendered for status:', currentStatus)

  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: () => {
      console.log('Load more triggered for mobile')
      if (isMobile && pagination.hasNext && !isLoading) {
        handleLoadMore()
      }
    },
    options: {
      rootMargin: '100px',
    },
  })

  if (isLoading && listings.length === 0) {
    return (
      <div className='min-h-[300px] flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-pulse text-gray-500'>{t('loading')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-[300px]'>
      {listings.length === 0 ? (
        <ListingEmptyState />
      ) : (
        <>
          <ListingsList
            listings={listings}
            onEditListing={(listing) =>
              console.log('Edit listing:', listing.id)
            }
            onPromoteListing={(listing) =>
              console.log('Promote listing:', listing.id)
            }
            onRepostListing={(listing) =>
              console.log('Repost listing:', listing.id)
            }
            onViewReport={(listing) => console.log('View report:', listing.id)}
            onRequestVerification={(listing) =>
              console.log('Request verification:', listing.id)
            }
            onCopyListing={(listing) =>
              console.log('Copy listing:', listing.id)
            }
            onRequestContact={(listing) =>
              console.log('Request contact:', listing.id)
            }
            onShare={(listing) => console.log('Share listing:', listing.id)}
            onActivityHistory={(listing) =>
              console.log('Activity history:', listing.id)
            }
            onTakeDown={(listing) =>
              console.log('Take down listing:', listing.id)
            }
            onDelete={(listing) => console.log('Delete listing:', listing.id)}
          />

          {/* Desktop: Show Pagination */}
          {!isMobile && (
            <div className='mt-8 flex justify-center'>
              <List.Pagination />
            </div>
          )}

          {isMobile && (
            <div className='mt-6 flex flex-col items-center gap-4'>
              {isLoading && (
                <div className='flex items-center justify-center py-4'>
                  <div className='animate-pulse text-gray-500 text-sm'>
                    {t('loadingMore')}
                  </div>
                </div>
              )}

              {pagination.hasNext && !isLoading && (
                <List.LoadMore
                  className='w-full max-w-xs'
                  variant='outline'
                  fullWidth={true}
                />
              )}

              {/* Invisible trigger for infinity scroll */}
              <div
                ref={loadMoreRef as React.RefObject<HTMLDivElement>}
                className='h-1 w-full'
                aria-hidden='true'
              />

              {!pagination.hasNext && listings.length > 0 && (
                <div className='text-center py-6 text-gray-500 text-sm'>
                  {tSeller('allListingsShown')}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const calculateCounts = () => {
  console.log('Calculating counts from mock data')
  return {
    all: MOCK_LISTINGS.length,
    expired: MOCK_LISTINGS.filter((item) => item.status === 'expired').length,
    expiring: MOCK_LISTINGS.filter((item) => item.status === 'expiring').length,
    active: MOCK_LISTINGS.filter((item) => item.status === 'active').length,
    pending: MOCK_LISTINGS.filter((item) => item.status === 'pending').length,
    review: MOCK_LISTINGS.filter((item) => item.status === 'review').length,
    payment: MOCK_LISTINGS.filter((item) => item.status === 'payment').length,
    rejected: MOCK_LISTINGS.filter((item) => item.status === 'rejected').length,
    archived: MOCK_LISTINGS.filter((item) => item.status === 'archived').length,
  }
}

export const ListingsManagementTemplate: React.FC = () => {
  const [status, setStatus] = useState<ListingStatus>('all')
  const [filterOpen, setFilterOpen] = useState(false)

  console.log('ListingsManagementTemplate rendered with status:', status)
  const counts = calculateCounts()

  const listings =
    status === 'all'
      ? MOCK_LISTINGS
      : MOCK_LISTINGS.filter((item: Property) => item.status === status)

  const listingsFetcher = useCallback(async () => {
    console.log('Simple fetcher called')
    return {
      data: MOCK_LISTINGS,
      total: MOCK_LISTINGS.length,
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    }
  }, [])

  return (
    <div className='p-3 sm:p-4'>
      <div className='mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6'>
        <ListingToolbar
          total={listings.length}
          onSearch={(query) => console.log('Search:', query)}
          onFilterClick={() => {
            console.log('Filter clicked')
            setFilterOpen(true)
          }}
          onExport={() => console.log('Export clicked')}
        />
        <ListingStatusFilterResponsive
          value={status}
          counts={counts}
          onChange={(newStatus) => {
            console.log('Status filter changed:', newStatus)
            setStatus(newStatus)
          }}
        />
        <List.Provider fetcher={listingsFetcher} defaultPerPage={5}>
          <ListingsWithPagination currentStatus={status} />
        </List.Provider>
      </div>

      <ListingFilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        onApply={() => {
          console.log('Apply filter')
          setFilterOpen(false)
        }}
        showProvinceSelection={false}
        onProvinceSelectionChange={(show) =>
          console.log('Province selection:', show)
        }
        showDistrictSelection={false}
        onDistrictSelectionChange={(show) =>
          console.log('District selection:', show)
        }
        showWardSelection={false}
        onWardSelectionChange={(show) => console.log('Ward selection:', show)}
        showListingTypeSelection={false}
        onListingTypeSelectionChange={(show) =>
          console.log('Listing type selection:', show)
        }
        onBackToMain={() => console.log('Back to main')}
      />
    </div>
  )
}
