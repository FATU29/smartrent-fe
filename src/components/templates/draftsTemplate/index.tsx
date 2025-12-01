import React, { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { DraftCard } from '@/components/molecules/draftCard'
import { DraftCardSkeleton } from '@/components/molecules/draftCard/DraftCardSkeleton'
import { DraftEmptyState } from '@/components/organisms/drafts/DraftEmptyState'
import { DeleteDraftDialog } from '@/components/molecules/deleteDraftDialog'
import { List, useListContext } from '@/contexts/list'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { useDeleteDraft } from '@/hooks/useListings/useDeleteDraft'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import type { ListingOwnerDetail } from '@/api/types'

interface DraftsTemplateProps {
  className?: string
}

const DraftsList: React.FC = () => {
  const {
    items: drafts,
    isLoading,
    pagination,
    loadMore,
  } = useListContext<ListingOwnerDetail>()
  const isMobile = useIsMobile()
  const t = useTranslations('common')
  const tDrafts = useTranslations('seller.drafts')
  const tDelete = useTranslations('seller.drafts.delete')
  const { currentPage, totalPages } = pagination
  const hasNext = currentPage < totalPages

  const [draftToDelete, setDraftToDelete] = useState<number | null>(null)
  const deleteMutation = useDeleteDraft()

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

  const handleDeleteClick = useCallback((listingId: number) => {
    setDraftToDelete(listingId)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (draftToDelete === null) return

    try {
      await deleteMutation.mutateAsync(String(draftToDelete))
      toast.success(tDelete('success'))
      setDraftToDelete(null)
    } catch {
      toast.error(tDelete('error'))
    }
  }, [draftToDelete, deleteMutation, tDelete])

  const handleCancelDelete = useCallback(() => {
    setDraftToDelete(null)
  }, [])

  if (isLoading && drafts.length === 0) {
    return <DraftCardSkeleton count={3} />
  }

  if (drafts.length === 0) {
    return <DraftEmptyState />
  }

  return (
    <>
      <div className='space-y-4'>
        {drafts.map((draft) => (
          <DraftCard
            key={draft.listingId}
            draft={{
              id: draft.listingId,
              title: draft.title,
              description: draft.description,
              address: draft.address.fullNewAddress,
              propertyType: draft.productType,
              price: draft.price,
              area: draft.area,
              bedrooms: draft.bedrooms,
              bathrooms: draft.bathrooms,
              images: draft.media?.map((m) => m.url) || [],
              createdAt: draft.createdAt,
              updatedAt: draft.updatedAt,
            }}
            onEdit={() => {
              // Navigate to edit draft (can be implemented later)
              console.log('Edit draft:', draft.listingId)
            }}
            onDelete={() => handleDeleteClick(draft.listingId)}
          />
        ))}

        {/* Desktop: Show Pagination */}
        {!isMobile && (
          <div className='mt-8 flex justify-center'>
            <List.Pagination />
          </div>
        )}

        {/* Mobile: Infinite scroll */}
        {isMobile && (
          <div className='mt-6 flex flex-col items-center gap-4'>
            {isLoading && (
              <div className='flex items-center justify-center py-4'>
                <Typography
                  variant='small'
                  className='animate-pulse text-muted-foreground'
                >
                  {t('loadingMore')}
                </Typography>
              </div>
            )}

            {hasNext && !isLoading && (
              <List.LoadMore
                className='w-full max-w-xs'
                variant='outline'
                fullWidth={true}
              />
            )}

            <div
              ref={loadMoreRef as React.RefObject<HTMLDivElement>}
              className='h-1 w-full'
              aria-hidden='true'
            />

            {!hasNext && drafts.length > 0 && (
              <Typography
                variant='small'
                className='text-center py-6 text-muted-foreground'
              >
                {tDrafts('allDraftsShown')}
              </Typography>
            )}
          </div>
        )}
      </div>

      <DeleteDraftDialog
        open={draftToDelete !== null}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}

export const DraftsTemplate: React.FC<DraftsTemplateProps> = ({
  className,
}) => {
  const t = useTranslations('seller.drafts')

  return (
    <div className={cn('p-3 sm:p-4', className)}>
      <div className='mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6'>
        {/* Header */}
        <div className='space-y-2'>
          <Typography variant='h1'>{t('title')}</Typography>
          <Typography variant='muted'>{t('description')}</Typography>
        </div>

        {/* Drafts List */}
        <List.Provider>
          <DraftsList />
        </List.Provider>
      </div>
    </div>
  )
}
