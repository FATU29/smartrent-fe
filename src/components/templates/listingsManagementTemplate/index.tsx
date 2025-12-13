import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ListingStatusFilterResponsive } from '@/components/molecules/listings/ListingStatusFilterResponsive'
import { ListingEmptyState } from '@/components/organisms/listings/ListingEmptyState'
import { ListingToolbar } from '@/components/molecules/listings/ListingToolbar'
import dynamic from 'next/dynamic'
import { ListingsList } from '@/components/organisms/listings-list'
import { useDeleteListing } from '@/hooks/useListings/useDeleteListing'
import { toast } from 'sonner'
import { DeleteListingDialog } from '@/components/molecules/deleteListingDialog'

const ResidentialFilterDialog = dynamic(
  () => import('@/components/molecules/residentialFilterDialog'),
  {
    ssr: false,
  },
)
import { useIsMobile } from '@/hooks/useIsMobile'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { List, useListContext } from '@/contexts/list'
import {
  ListingOwnerDetail,
  PostStatus,
  POST_STATUS,
  ListingFilterRequest,
} from '@/api/types'

const ListingsWithPagination = () => {
  const {
    items: listings,
    isLoading,
    pagination,
    loadMore,
    removeItem,
  } = useListContext<ListingOwnerDetail>()
  const isMobile = useIsMobile()
  const t = useTranslations('common')
  const tSeller = useTranslations('seller.listingManagement')
  const { currentPage, totalPages } = pagination
  const hasNext = currentPage < totalPages
  const { updateFilters } = useListContext<ListingFilterRequest>()
  const deleteMutation = useDeleteListing()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedListingForDelete, setSelectedListingForDelete] =
    useState<ListingOwnerDetail | null>(null)

  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: () => {
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
            onEditListing={(listing) => {
              window.location.href = `/seller/update-post/${listing.listingId}`
            }}
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
            onDelete={(listing) => {
              setSelectedListingForDelete(listing)
              setDeleteDialogOpen(true)
            }}
          />

          <DeleteListingDialog
            listing={selectedListingForDelete}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={(listing) => {
              const id = listing.listingId
              // Optimistic delete: remove from UI immediately
              removeItem(id)
              setSelectedListingForDelete(null)
              setDeleteDialogOpen(false)

              deleteMutation.mutate(
                { id },
                {
                  onSuccess: () => {
                    toast.success(tSeller('card.toast.deleteSuccess'))
                  },
                  onError: (err) => {
                    toast.error(
                      err.message || tSeller('card.toast.deleteError'),
                    )

                    updateFilters({ page: 1 })
                  },
                },
              )
            }}
            isLoading={deleteMutation.isPending}
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

const ToolbarWithBadge: React.FC<{
  total: number
  onFilterClick: () => void
}> = ({ total, onFilterClick }) => {
  const { updateFilters } = useListContext()

  return (
    <ListingToolbar
      total={total}
      onSearch={(query) => updateFilters({ keyword: query, page: 1 })}
      onFilterClick={onFilterClick}
    />
  )
}

const FilterDialogWrapper: React.FC<{
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: () => void
}> = ({ open, onOpenChange, onApply }) => {
  const t = useTranslations('seller.listingManagement')

  return (
    <ResidentialFilterDialog
      onOpenChange={onOpenChange}
      open={open}
      title={t('filter.title')}
      onApply={onApply}
      hideLocationFilter
    />
  )
}

export const ListingsManagementTemplate: React.FC<
  ListingsManagementTemplateProps
> = ({ children }) => {
  const [status, setStatus] = useState<PostStatus>(POST_STATUS.ALL)
  const [filterOpen, setFilterOpen] = useState(false)
  const { items: listings, updateFilters } =
    useListContext<ListingFilterRequest>()

  return (
    <div className='p-3 sm:p-4'>
      <div className='mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6'>
        <ListingStatusFilterResponsive
          value={status}
          onChange={(newStatus) => {
            setStatus(newStatus)
            updateFilters({
              listingStatus:
                newStatus === POST_STATUS.ALL ? undefined : newStatus,
            })
          }}
          hideCount
        />
        {children}
        <ToolbarWithBadge
          total={listings.length}
          onFilterClick={() => {
            setFilterOpen(true)
          }}
        />
        <ListingsWithPagination />
        <FilterDialogWrapper
          open={filterOpen}
          onOpenChange={setFilterOpen}
          onApply={() => setFilterOpen(false)}
        />
      </div>
    </div>
  )
}
