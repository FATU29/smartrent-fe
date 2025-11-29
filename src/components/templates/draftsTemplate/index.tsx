import React from 'react'
import { useTranslations } from 'next-intl'
import { DraftCard } from '@/components/molecules/draftCard'
import { DraftCardSkeleton } from '@/components/molecules/draftCard/DraftCardSkeleton'
import { DraftEmptyState } from '@/components/organisms/drafts/DraftEmptyState'
import { List, useListContext } from '@/contexts/list'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import type { Draft } from '@/types/draft.types'

interface DraftsTemplateProps {
  className?: string
}

const DraftsList: React.FC = () => {
  const {
    items: drafts,
    isLoading,
    pagination,
    loadMore,
  } = useListContext<Draft>()
  const isMobile = useIsMobile()
  const t = useTranslations('common')
  const tDrafts = useTranslations('seller.drafts')
  const { currentPage, totalPages } = pagination
  const hasNext = currentPage < totalPages

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

  if (isLoading && drafts.length === 0) {
    return <DraftCardSkeleton count={3} />
  }

  if (drafts.length === 0) {
    return <DraftEmptyState />
  }

  return (
    <div className='space-y-4'>
      {drafts.map((draft) => (
        <DraftCard
          key={draft.id}
          draft={draft}
          onEdit={() => {
            // Navigate to edit draft (can be implemented later)
            console.log('Edit draft:', draft.id)
          }}
          onDelete={() => {
            // Delete draft (can be implemented later)
            console.log('Delete draft:', draft.id)
          }}
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
