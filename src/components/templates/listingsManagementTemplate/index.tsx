import React, { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { ListingStatusFilterResponsive } from '@/components/molecules/listings/ListingStatusFilterResponsive'
import { ListingEmptyState } from '@/components/organisms/listings/ListingEmptyState'
import { ListingToolbar } from '@/components/molecules/listings/ListingToolbar'
import ResidentialFilterDialog from '@/components/molecules/residentialFilterDialog'
import { ListingsList } from '@/components/organisms/listings-list'
import { ListingListSkeleton } from '@/components/organisms/listings-list/ListingListSkeleton'
import { useDeleteListing } from '@/hooks/useListings/useDeleteListing'
import { useResubmitListing } from '@/hooks/useListings/useResubmitListing'
import { toast } from 'sonner'
import { DeleteListingDialog } from '@/components/molecules/deleteListingDialog'
import { ResubmitListingDialog } from '@/components/molecules/moderation'
import { MembershipPushDisplay } from '@/components/molecules/listings/MembershipPushDisplay'
import { usePushListing, usePushQuota } from '@/hooks/usePush'
import PushLimitModal from '@/components/molecules/pushLimitModal'
import { PushLimitError } from '@/api/types/push.type'
import { PageContainer } from '@/components/atoms/pageContainer'
import { Typography } from '@/components/atoms/typography'

import { useIsMobile } from '@/hooks/useIsMobile'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { List, useListContext } from '@/contexts/list'
import { useMyMembership } from '@/hooks/useMembership'
import { useAuthContext } from '@/contexts/auth'
import {
  ListingOwnerDetail,
  PostStatus,
  POST_STATUS,
  ModerationStatus,
  ListingFilterRequest,
} from '@/api/types'
import {
  isModerationFilterStatus,
  extractModerationStatus,
  toModerationFilterStatus,
  getModerationStatuses,
  LISTING_STATUS_MODERATION_MAP,
  type ListingFilterStatus,
} from '@/constants/postStatus'

const ListingsWithPagination = () => {
  const router = useRouter()
  const {
    items: listings,
    isLoading,
    pagination,
    loadMore,
    removeItem,
  } = useListContext<ListingOwnerDetail>()
  const { user } = useAuthContext()
  const { data: membershipData, isLoading: isMembershipLoading } =
    useMyMembership(user?.userId)
  const { data: quotaData, refetch: refetchQuota } = usePushQuota()
  const pushMutation = usePushListing()
  const isMobile = useIsMobile()
  const t = useTranslations('common')
  const tSeller = useTranslations('seller.listingManagement')
  const tModeration = useTranslations('seller.moderation.resubmit')
  const { currentPage, totalPages } = pagination
  const hasNext = currentPage < totalPages
  const { updateFilters } = useListContext<ListingFilterRequest>()
  const deleteMutation = useDeleteListing()
  const resubmitMutation = useResubmitListing()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedListingForDelete, setSelectedListingForDelete] =
    useState<ListingOwnerDetail | null>(null)
  const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false)
  const [selectedListingForResubmit, setSelectedListingForResubmit] =
    useState<ListingOwnerDetail | null>(null)
  const [pushLimitState, setPushLimitState] = useState<{
    open: boolean
    waitMinutes: number
    apiMessage?: string | null
  }>({ open: false, waitMinutes: 1, apiMessage: null })

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

  const handlePushListing = async (listing: ListingOwnerDetail) => {
    const canPush =
      listing.verified === true &&
      listing.listingStatus === POST_STATUS.DISPLAYING

    if (!canPush) {
      toast.error(tSeller('card.toast.pushNotDisplaying'))
      return
    }

    const hasQuota = quotaData?.data && quotaData.data.totalAvailable > 0
    const useMembershipQuota = hasQuota ?? false

    try {
      const result = await pushMutation.mutateAsync({
        listingId: listing.listingId,
        useMembershipQuota: useMembershipQuota,
        paymentProvider: useMembershipQuota ? undefined : 'VNPAY',
      })

      // If payment URL is returned, it will be handled in the hook's onSuccess
      if (result.data?.paymentUrl) {
        toast.loading('Redirecting to payment...')
      } else {
        const successMessage = useMembershipQuota
          ? tSeller('card.toast.pushSuccessWithQuota')
          : tSeller('card.toast.pushSuccess')
        toast.success(successMessage)
        // Trigger quota refresh
        refetchQuota()
      }
    } catch (error: unknown) {
      if (error instanceof PushLimitError) {
        setPushLimitState({
          open: true,
          waitMinutes: error.waitMinutes,
          apiMessage: error.message || null,
        })
        return
      }
      const message =
        error instanceof Error ? error.message : tSeller('card.toast.pushError')
      toast.error(message || tSeller('card.toast.pushError'))
    }
  }

  if (isLoading && listings.length === 0) {
    return (
      <div className='min-h-[300px]'>
        <ListingListSkeleton count={3} />
      </div>
    )
  }

  return (
    <div className='min-h-[300px]'>
      {listings.length === 0 ? (
        <ListingEmptyState />
      ) : (
        <>
          {/* Membership Push Display */}
          <MembershipPushDisplay
            membershipData={membershipData}
            isLoading={isMembershipLoading}
            className='mb-4'
          />

          <ListingsList
            listings={listings}
            onEditListing={(listing) => {
              // Redirect to update-post with resubmit context for rejected/revision-required listings
              const isRejected =
                listing.moderationStatus === ModerationStatus.REJECTED ||
                listing.moderationStatus === ModerationStatus.REVISION_REQUIRED
              if (isRejected) {
                router.push(
                  `/seller/update-post/${listing.listingId}?resubmit=true`,
                )
              } else {
                router.push(`/seller/update-post/${listing.listingId}`)
              }
            }}
            onPromoteListing={(listing) => {
              handlePushListing(listing)
            }}
            onRepostListing={() => {
              // TODO: Implement repost listing
            }}
            onResubmitListing={(listing) => {
              // Redirect to update-post with resubmit context
              router.push(
                `/seller/update-post/${listing.listingId}?resubmit=true`,
              )
            }}
            onViewReport={() => {
              // TODO: Implement view report
            }}
            onRequestVerification={() => {
              // TODO: Implement request verification
            }}
            onCopyListing={() => {
              // TODO: Implement copy listing
            }}
            onRequestContact={() => {
              // TODO: Implement request contact
            }}
            onShare={() => {
              // TODO: Implement share listing
            }}
            onActivityHistory={() => {
              // TODO: Implement activity history
            }}
            onTakeDown={() => {
              // TODO: Implement take down listing
            }}
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

          <ResubmitListingDialog
            listing={selectedListingForResubmit}
            open={resubmitDialogOpen}
            onOpenChange={setResubmitDialogOpen}
            onConfirm={(listing, notes) => {
              resubmitMutation.mutate(
                { listingId: listing.listingId, notes },
                {
                  onSuccess: () => {
                    toast.success(tModeration('success'))
                    setSelectedListingForResubmit(null)
                    setResubmitDialogOpen(false)
                    // Refresh listings
                    updateFilters({ page: 1 })
                  },
                  onError: (err) => {
                    toast.error(err.message || tModeration('error'))
                  },
                },
              )
            }}
            isLoading={resubmitMutation.isPending}
          />

          <PushLimitModal
            open={pushLimitState.open}
            onOpenChange={(open) =>
              setPushLimitState((prev) => ({ ...prev, open }))
            }
            waitMinutes={pushLimitState.waitMinutes}
            apiMessage={pushLimitState.apiMessage}
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
                  <div className='animate-pulse text-muted-foreground text-sm'>
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
                <div className='text-center py-6 text-muted-foreground text-sm'>
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
  keyword: string
  onMoreFiltersClick: () => void
}> = ({ total, keyword, onMoreFiltersClick }) => {
  const { updateFilters } = useListContext()

  return (
    <ListingToolbar
      total={total}
      keyword={keyword}
      onSearch={(query) => updateFilters({ keyword: query, page: 1 })}
      onMoreFiltersClick={onMoreFiltersClick}
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
      hideVerifiedFilter
      hideBrokerFilter
      hideViewMapButton
    />
  )
}

export const ListingsManagementTemplate: React.FC<
  ListingsManagementTemplateProps
> = ({ children }) => {
  const tNav = useTranslations('navigation.seller')
  const [status, setStatus] = useState<ListingFilterStatus>(
    POST_STATUS.ALL as ListingFilterStatus,
  )
  const [filterOpen, setFilterOpen] = useState(false)
  const {
    items: listings,
    filters,
    updateFilters,
  } = useListContext<ListingFilterRequest>()

  // ── Sync tab UI when filters are externally reset ──
  // e.g. ResidentialFilterDialog "Reset" calls resetFilters() on the context,
  // which clears listingStatus/moderationStatus but leaves our local `status`
  // stale. This effect brings the tab back to "All".
  useEffect(() => {
    if (!filters.listingStatus && !filters.moderationStatus) {
      setStatus(POST_STATUS.ALL as ListingFilterStatus)
    }
  }, [filters.listingStatus, filters.moderationStatus])

  // ── Centralized status-change handler ──
  const handleStatusChange = useCallback(
    (newStatus: ListingFilterStatus) => {
      if (
        newStatus === POST_STATUS.ALL ||
        newStatus === (POST_STATUS.ALL as ListingFilterStatus)
      ) {
        // "All" tab — clear both filters
        setStatus(POST_STATUS.ALL as ListingFilterStatus)
        updateFilters({
          listingStatus: undefined,
          moderationStatus: undefined,
          page: 1,
        })
      } else if (isModerationFilterStatus(newStatus)) {
        // Moderation sub-filter clicked
        setStatus(newStatus)
        const modStatus = extractModerationStatus(newStatus)
        const parentStatus = Object.entries(LISTING_STATUS_MODERATION_MAP).find(
          ([, mods]) => (mods as string[]).includes(modStatus ?? ''),
        )?.[0] as PostStatus | undefined

        updateFilters({
          listingStatus: parentStatus ?? (newStatus as PostStatus),
          moderationStatus: modStatus ?? undefined,
          page: 1,
        })
      } else {
        const listingStatus = newStatus as PostStatus
        const moderationStatuses = getModerationStatuses(listingStatus)

        if (moderationStatuses.length > 1) {
          // Has sub-filters → default to first
          const defaultMod = moderationStatuses[0]
          setStatus(toModerationFilterStatus(defaultMod))
          updateFilters({
            listingStatus,
            moderationStatus: defaultMod,
            page: 1,
          })
        } else if (moderationStatuses.length === 1) {
          // Single moderation status → pass directly
          setStatus(newStatus)
          updateFilters({
            listingStatus,
            moderationStatus: moderationStatuses[0],
            page: 1,
          })
        } else {
          // No moderation status (EXPIRED, PENDING_PAYMENT)
          setStatus(newStatus)
          updateFilters({
            listingStatus,
            moderationStatus: undefined,
            page: 1,
          })
        }
      }
    },
    [updateFilters],
  )

  return (
    <PageContainer width='grid' padded={false} className='p-3 sm:p-4'>
      <div className='flex flex-col gap-4 sm:gap-6'>
        <Typography variant='pageTitle'>{tNav('listings')}</Typography>
        <ListingStatusFilterResponsive
          value={status}
          onChange={handleStatusChange}
          hideCount
        />
        {children}
        <ToolbarWithBadge
          total={listings.length}
          keyword={filters.keyword ?? ''}
          onMoreFiltersClick={() => {
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
    </PageContainer>
  )
}
