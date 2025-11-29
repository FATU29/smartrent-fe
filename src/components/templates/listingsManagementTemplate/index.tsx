import React, { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { ListingStatusFilterResponsive } from '@/components/molecules/listings/ListingStatusFilterResponsive'
import { ListingEmptyState } from '@/components/organisms/listings/ListingEmptyState'
import { ListingToolbar } from '@/components/molecules/listings/ListingToolbar'
import dynamic from 'next/dynamic'
import { ListingsList } from '@/components/organisms/listings-list'

const ResidentialFilterDialog = dynamic(
  () => import('@/components/molecules/residentialFilterDialog'),
  {
    ssr: false,
  },
)
import { useIsMobile } from '@/hooks/useIsMobile'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { List, useListContext } from '@/contexts/list'
import { countActiveFilters } from '@/utils/filters/countActiveFilters'
import { ListingOwnerDetail, PostStatus, POST_STATUS } from '@/api/types'
import { MOCK_LISTINGS } from '@/mock/ownerListing'

const ListingsWithPagination: React.FC<{ currentStatus: PostStatus }> = ({
  currentStatus,
}) => {
  const {
    items: listings,
    isLoading,
    pagination,
    loadMore,
  } = useListContext<ListingOwnerDetail>()
  const isMobile = useIsMobile()
  const t = useTranslations('common')
  const tSeller = useTranslations('seller.listingManagement')
  const { currentPage, totalPages } = pagination
  const hasNext = currentPage < totalPages

  console.log('ListingsWithPagination rendered for status:', currentStatus)

  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: () => {
      console.log('Load more triggered for mobile')
      if (isMobile && hasNext && !isLoading) {
        loadMore()
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
              console.log('Edit listing:', listing.listingId)
            }
            onPromoteListing={(listing) =>
              console.log('Promote listing:', listing.listingId)
            }
            onRepostListing={(listing) =>
              console.log('Repost listing:', listing.listingId)
            }
            onViewReport={(listing) =>
              console.log('View report:', listing.listingId)
            }
            onRequestVerification={(listing) =>
              console.log('Request verification:', listing.listingId)
            }
            onCopyListing={(listing) =>
              console.log('Copy listing:', listing.listingId)
            }
            onRequestContact={(listing) =>
              console.log('Request contact:', listing.listingId)
            }
            onShare={(listing) =>
              console.log('Share listing:', listing.listingId)
            }
            onActivityHistory={(listing) =>
              console.log('Activity history:', listing.listingId)
            }
            onTakeDown={(listing) =>
              console.log('Take down listing:', listing.listingId)
            }
            onDelete={(listing) =>
              console.log('Delete listing:', listing.listingId)
            }
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

              {hasNext && !isLoading && (
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

              {!hasNext && listings.length > 0 && (
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

export interface ListingsManagementTemplateProps {
  children?: React.ReactNode
}

export const ListingsManagementTemplate: React.FC<
  ListingsManagementTemplateProps
> = ({ children }) => {
  const [status, setStatus] = useState<PostStatus>(POST_STATUS.ALL)
  const [filterOpen, setFilterOpen] = useState(false)

  // Calculate counts for each status from MOCK_LISTINGS
  const counts = useMemo(() => {
    const statusCounts: Partial<Record<PostStatus, number>> = {
      [POST_STATUS.ALL]: MOCK_LISTINGS.length,
    }

    MOCK_LISTINGS.forEach((listing) => {
      if (listing.status) {
        statusCounts[listing.status] = (statusCounts[listing.status] || 0) + 1
      }
    })

    return statusCounts
  }, [])

  return (
    <div className='p-3 sm:p-4'>
      <div className='mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6'>
        <ListingStatusFilterResponsive
          value={status}
          counts={counts}
          onChange={(newStatus) => {
            console.log('Status filter changed:', newStatus)
            setStatus(newStatus)
          }}
        />
        {children}
        <ToolbarWithBadge
          total={MOCK_LISTINGS.length}
          onFilterClick={() => {
            console.log('Filter clicked')
            setFilterOpen(true)
          }}
        />
        <ListingsWithPagination currentStatus={status} />
        <FilterDialogWrapper open={filterOpen} onOpenChange={setFilterOpen} />
      </div>
    </div>
  )
}

const ToolbarWithBadge: React.FC<{
  total: number
  onFilterClick: () => void
}> = ({ total, onFilterClick }) => {
  return (
    <ListingToolbar
      total={total}
      onSearch={(query) => console.log('Search:', query)}
      onFilterClick={onFilterClick}
      onExport={() => console.log('Export clicked')}
      filterButtonChildren={<FilterButtonBadge />}
    />
  )
}

const FilterButtonBadge: React.FC = () => {
  const { filters, activeFilterCount } = useListContext()
  const activeFiltersCount = activeFilterCount || countActiveFilters(filters)

  if (activeFiltersCount === 0) return null

  return (
    <span className='ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary'>
      {activeFiltersCount}
    </span>
  )
}

const FilterDialogWrapper: React.FC<{
  open: boolean
  onOpenChange: (open: boolean) => void
}> = ({ open, onOpenChange }) => {
  const t = useTranslations('seller.listingManagement')

  return (
    <ResidentialFilterDialog
      onOpenChange={onOpenChange}
      open={open}
      title={t('filter.title')}
    />
  )
}
