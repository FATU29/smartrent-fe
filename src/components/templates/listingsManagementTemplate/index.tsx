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
import { useTakeDownListing } from '@/hooks/useListings/useTakeDownListing'
import { useRepostListing } from '@/hooks/useRepost'
import { useRenewListing } from '@/hooks/useRenew'
import { toast } from 'sonner'
import { DeleteListingDialog } from '@/components/molecules/deleteListingDialog'
import { TakeDownListingDialog } from '@/components/molecules/takeDownListingDialog'
import { RepostListingDialog } from '@/components/molecules/repostListingDialog'
import { RenewListingDialog } from '@/components/molecules/renewListingDialog'
import {
  ResubmitListingDialog,
  PostingBlockedBanner,
} from '@/components/molecules/moderation'
import { PUBLIC_ROUTES } from '@/constants/route'
import { MembershipPushDisplay } from '@/components/molecules/listings/MembershipPushDisplay'
import { usePushListing, usePushQuota } from '@/hooks/usePush'
import PushLimitModal from '@/components/molecules/pushLimitModal'
import PushPaymentConfirmModal from '@/components/molecules/pushPaymentConfirmModal'
import { PushLimitError } from '@/api/types/push.type'
import { PageContainer } from '@/components/atoms/pageContainer'
import { Typography } from '@/components/atoms/typography'

import { useIsMobile } from '@/hooks/useIsMobile'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { List, useListContext } from '@/contexts/list'
import { useMyMembership } from '@/hooks/useMembership'
import { useAuthContext } from '@/contexts/auth'
import { isSePayResult } from '@/utils/payment'
import { PENDING_SELLER_LISTING_ACTION_KEY } from '@/constants/payment'
import {
  ListingOwnerDetail,
  PostStatus,
  POST_STATUS,
  ListingFilterRequest,
  ResubmitNotAllowedError,
} from '@/api/types'
import {
  isModerationFilterStatus,
  getModerationStatuses,
  extractModerationStatus,
  toModerationFilterStatus,
  LISTING_STATUS_MODERATION_MAP,
  type ListingFilterStatus,
} from '@/constants/postStatus'

// Inverse of handleStatusChange: which tab do these filters represent? Used to
// seed the tab from URL query params on first render. A listing status with
// sub-filters and no moderationStatus keeps the parent tab selected — the list
// really is showing every sub-state, so no sub-tab should look active.
const statusFromFilters = (
  filters: Partial<ListingFilterRequest>,
): ListingFilterStatus => {
  if (filters.moderationStatus) {
    return toModerationFilterStatus(filters.moderationStatus)
  }
  if (filters.listingStatus) {
    return filters.listingStatus as ListingFilterStatus
  }
  return POST_STATUS.ALL as ListingFilterStatus
}

const ListingsWithPagination = () => {
  const router = useRouter()
  const {
    items: listings,
    isLoading,
    pagination,
    loadMore,
    removeItem,
    refetch,
  } = useListContext<ListingOwnerDetail>()
  const { user } = useAuthContext()
  const { data: myMembership, isLoading: isMembershipLoading } =
    useMyMembership(user?.userId)
  const membershipData = myMembership?.current ?? null
  const { data: quotaData, refetch: refetchQuota } = usePushQuota()
  const pushMutation = usePushListing()
  const isMobile = useIsMobile()
  const t = useTranslations('common')
  const tSeller = useTranslations('seller.listingManagement')
  const tModeration = useTranslations('seller.moderation.resubmit')
  const { currentPage, totalPages } = pagination
  const hasNext = currentPage < totalPages
  const deleteMutation = useDeleteListing()
  const resubmitMutation = useResubmitListing()
  const takeDownMutation = useTakeDownListing()
  const repostMutation = useRepostListing()
  const renewMutation = useRenewListing()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedListingForDelete, setSelectedListingForDelete] =
    useState<ListingOwnerDetail | null>(null)
  const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false)
  const [selectedListingForResubmit, setSelectedListingForResubmit] =
    useState<ListingOwnerDetail | null>(null)
  const [takeDownDialogOpen, setTakeDownDialogOpen] = useState(false)
  const [selectedListingForTakeDown, setSelectedListingForTakeDown] =
    useState<ListingOwnerDetail | null>(null)
  const [repostDialogOpen, setRepostDialogOpen] = useState(false)
  const [selectedListingForRepost, setSelectedListingForRepost] =
    useState<ListingOwnerDetail | null>(null)
  const [renewDialogOpen, setRenewDialogOpen] = useState(false)
  const [selectedListingForRenew, setSelectedListingForRenew] =
    useState<ListingOwnerDetail | null>(null)
  const [pushLimitState, setPushLimitState] = useState<{
    open: boolean
    waitMinutes: number
    apiMessage?: string | null
  }>({ open: false, waitMinutes: 1, apiMessage: null })
  const [pushPaymentState, setPushPaymentState] = useState<{
    open: boolean
    listing: ListingOwnerDetail | null
  }>({ open: false, listing: null })

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

  const handleCopyListingLink = async (listing: ListingOwnerDetail) => {
    const url = `${window.location.origin}${PUBLIC_ROUTES.APARTMENT_DETAIL_PREFIX}/${listing.listingId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success(tSeller('card.toast.copyLinkSuccess'))
    } catch {
      toast.error(tSeller('card.toast.copyLinkError'))
    }
  }

  const runPushMutation = async (
    listing: ListingOwnerDetail,
    useMembershipQuota: boolean,
  ) => {
    // On the payment path the user leaves for the gateway and returns to
    // /payment/result — leave a marker so it routes back to the listings.
    if (!useMembershipQuota) {
      sessionStorage.setItem(
        PENDING_SELLER_LISTING_ACTION_KEY,
        JSON.stringify({ type: 'push' }),
      )
    }

    try {
      const result = await pushMutation.mutateAsync({
        listingId: listing.listingId,
        useMembershipQuota: useMembershipQuota,
        paymentProvider: useMembershipQuota ? undefined : 'SEPAY',
      })

      if (isSePayResult(result.data) || result.data?.paymentUrl) {
        // Payment required — the push hook is sending the user to the gateway
        // (SePay POST-form / others GET-redirect). Push applies on the webhook.
        toast.loading(tSeller('card.toast.pushRedirectingToPayment'))
      } else {
        // Quota path: push already applied — refresh and stay on the page.
        sessionStorage.removeItem(PENDING_SELLER_LISTING_ACTION_KEY)
        const successMessage = useMembershipQuota
          ? tSeller('card.toast.pushSuccessWithQuota')
          : tSeller('card.toast.pushSuccess')
        toast.success(successMessage)
        // Trigger quota refresh
        refetchQuota()
      }
    } catch (error: unknown) {
      sessionStorage.removeItem(PENDING_SELLER_LISTING_ACTION_KEY)
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

  const handlePushListing = async (listing: ListingOwnerDetail) => {
    // A listing is publicly live under both DISPLAYING and EXPIRING_SOON — see
    // the matching check in listing-card's `isPubliclyVisible`. Pushing an
    // EXPIRING_SOON listing is if anything more useful, since the seller is
    // trying to keep visibility right before it expires.
    const canPush =
      listing.verified === true &&
      (listing.listingStatus === POST_STATUS.DISPLAYING ||
        listing.listingStatus === POST_STATUS.EXPIRING_SOON)

    if (!canPush) {
      toast.error(tSeller('card.toast.pushNotDisplaying'))
      return
    }

    const hasQuota = quotaData?.data && quotaData.data.totalAvailable > 0
    const useMembershipQuota = hasQuota ?? false

    if (!useMembershipQuota) {
      // No quota left — show the 40k one-time push price and let the seller
      // opt in before firing the payment mutation (and its gateway redirect).
      setPushPaymentState({ open: true, listing })
      return
    }

    await runPushMutation(listing, true)
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
              router.push(`/seller/update-post/${listing.listingId}`)
            }}
            onPromoteListing={(listing) => {
              handlePushListing(listing)
            }}
            onRepostListing={(listing) => {
              setSelectedListingForRepost(listing)
              setRepostDialogOpen(true)
            }}
            onRenewListing={(listing) => {
              setSelectedListingForRenew(listing)
              setRenewDialogOpen(true)
            }}
            onCopyListing={(listing) => {
              handleCopyListingLink(listing)
            }}
            onTakeDown={(listing) => {
              setSelectedListingForTakeDown(listing)
              setTakeDownDialogOpen(true)
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
                    // Restore the optimistically removed item on failure.
                    refetch()
                  },
                },
              )
            }}
            isLoading={deleteMutation.isPending}
          />

          <TakeDownListingDialog
            listing={selectedListingForTakeDown}
            open={takeDownDialogOpen}
            onOpenChange={setTakeDownDialogOpen}
            onConfirm={(listing) => {
              const id = listing.listingId
              setSelectedListingForTakeDown(null)
              setTakeDownDialogOpen(false)

              takeDownMutation.mutate(
                { listingId: id },
                {
                  onSuccess: () => {
                    toast.success(tSeller('card.toast.takeDownSuccess'))
                    // Take-down does not delete — the listing now has EXPIRED
                    // status. Force a refetch so it reappears (with EXPIRED
                    // badge) on the "All" / "Expired" tab. updateFilters with
                    // unchanged values is a no-op in the list context.
                    refetch()
                  },
                  onError: (err) => {
                    toast.error(
                      err.message || tSeller('card.toast.takeDownError'),
                    )
                  },
                },
              )
            }}
            isLoading={takeDownMutation.isPending}
          />

          <RepostListingDialog
            listing={selectedListingForRepost}
            open={repostDialogOpen}
            onOpenChange={setRepostDialogOpen}
            isLoading={repostMutation.isPending}
            onConfirm={({
              listing,
              useMembershipQuota,
              durationDays,
              paymentProvider,
              vipType,
            }) => {
              // On the payment path the user leaves for the gateway and returns
              // to /payment/result — mark so it routes back to the listings.
              if (!useMembershipQuota) {
                sessionStorage.setItem(
                  PENDING_SELLER_LISTING_ACTION_KEY,
                  JSON.stringify({ type: 'repost' }),
                )
              }
              repostMutation.mutate(
                {
                  listingId: listing.listingId,
                  useMembershipQuota,
                  paymentProvider: useMembershipQuota
                    ? undefined
                    : paymentProvider,
                  durationDays,
                  vipType: useMembershipQuota ? vipType : undefined,
                },
                {
                  onSuccess: (data) => {
                    setSelectedListingForRepost(null)
                    setRepostDialogOpen(false)

                    // Payment required: the repost hook is sending the user to
                    // the gateway (SePay POST-form / others GET-redirect); the
                    // listing reactivates on the webhook. Quota path: already
                    // live → refetch the list.
                    if (isSePayResult(data.data) || data.data?.paymentUrl) {
                      toast.loading(
                        tSeller('card.toast.repostRedirectingToPayment'),
                      )
                    } else {
                      sessionStorage.removeItem(
                        PENDING_SELLER_LISTING_ACTION_KEY,
                      )
                      toast.success(tSeller('card.toast.repostSuccess'))
                      refetch()
                    }
                  },
                  onError: (err) => {
                    sessionStorage.removeItem(PENDING_SELLER_LISTING_ACTION_KEY)
                    toast.error(
                      err.message || tSeller('card.toast.repostError'),
                    )
                  },
                },
              )
            }}
          />

          <RenewListingDialog
            listing={selectedListingForRenew}
            open={renewDialogOpen}
            onOpenChange={setRenewDialogOpen}
            isLoading={renewMutation.isPending}
            onConfirm={({ listing }) => {
              renewMutation.mutate(
                { listingId: listing.listingId },
                {
                  onSuccess: () => {
                    setSelectedListingForRenew(null)
                    setRenewDialogOpen(false)
                    toast.success(tSeller('card.toast.renewSuccess'))
                    refetch()
                  },
                  onError: (err) => {
                    toast.error(err.message || tSeller('card.toast.renewError'))
                  },
                },
              )
            }}
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
                    refetch()
                  },
                  onError: (err) => {
                    toast.error(
                      err instanceof ResubmitNotAllowedError
                        ? tModeration('notAllowed')
                        : err.message || tModeration('error'),
                    )
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

          <PushPaymentConfirmModal
            open={pushPaymentState.open}
            onOpenChange={(open) =>
              setPushPaymentState((prev) => ({ ...prev, open }))
            }
            listing={pushPaymentState.listing}
            isLoading={pushMutation.isPending}
            onConfirm={() => {
              const listing = pushPaymentState.listing
              if (!listing) return
              setPushPaymentState({ open: false, listing: null })
              runPushMutation(listing, false)
            }}
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
      hideVerifiedFilter
      hideBrokerFilter
      hideViewMapButton
      showListingIdFilter
    />
  )
}

export const ListingsManagementTemplate: React.FC<
  ListingsManagementTemplateProps
> = ({ children }) => {
  const tNav = useTranslations('navigation.seller')
  const { user } = useAuthContext()
  const [filterOpen, setFilterOpen] = useState(false)
  const {
    items: listings,
    filters,
    updateFilters,
  } = useListContext<ListingFilterRequest>()
  // Seeded from the filters the page parsed out of the URL, so a deep link
  // (?listingStatus=EXPIRING_SOON — e.g. the chatbot's "Xem tất cả" chip)
  // lands on the matching tab instead of highlighting "Tất cả" while showing
  // a filtered list.
  const [status, setStatus] = useState<ListingFilterStatus>(() =>
    statusFromFilters(filters),
  )

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
        const parentStatus = Object.entries(LISTING_STATUS_MODERATION_MAP).find(
          ([, subFilters]) =>
            (subFilters as ListingFilterStatus[]).includes(newStatus),
        )?.[0] as PostStatus | undefined

        updateFilters({
          listingStatus: parentStatus ?? (newStatus as PostStatus),
          moderationStatus: extractModerationStatus(newStatus) ?? undefined,
          page: 1,
        })
      } else {
        const listingStatus = newStatus as PostStatus
        const subFilters = getModerationStatuses(listingStatus)

        if (subFilters.length > 1) {
          // Has sub-filters → default to first
          const defaultSub = subFilters[0]
          setStatus(defaultSub)
          updateFilters({
            listingStatus,
            moderationStatus: extractModerationStatus(defaultSub) ?? undefined,
            page: 1,
          })
        } else if (subFilters.length === 1) {
          // Single sub-filter → pass directly, tab stays at the parent level
          setStatus(newStatus)
          updateFilters({
            listingStatus,
            moderationStatus:
              extractModerationStatus(subFilters[0]) ?? undefined,
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
        {user?.postingBlocked && (
          <PostingBlockedBanner reason={user.postingBlockedReason} />
        )}
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
