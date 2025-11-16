import React, { useCallback } from 'react'
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
    itemsData: drafts,
    isLoading,
    pagination,
    handleLoadMore,
  } = useListContext<Draft>()
  const isMobile = useIsMobile()
  const t = useTranslations('common')
  const tDrafts = useTranslations('seller.drafts')

  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: () => {
      if (isMobile && pagination.hasNext && !isLoading) {
        handleLoadMore()
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

          {pagination.hasNext && !isLoading && (
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

          {!pagination.hasNext && drafts.length > 0 && (
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

  // Mock fetcher - will be replaced with real API call
  const draftsFetcher = useCallback(async () => {
    // TODO: Replace with real API call
    const mockDrafts: Draft[] = [
      {
        id: 1,
        title: 'Căn hộ 2PN tại Quận 1',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        propertyType: 'APARTMENT',
        price: 15000000,
        area: 60,
        bedrooms: 2,
        bathrooms: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
      },
      {
        id: 2,
        address: '456 Lê Lợi, Quận 3, TP.HCM',
        propertyType: 'HOUSE',
        price: 25000000,
        area: 100,
        bedrooms: 3,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'draft',
      },
      {
        id: 3,
        title: 'Studio hiện đại',
        price: 8000000,
        area: 30,
        bedrooms: 0,
        bathrooms: 1,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        status: 'draft',
      },
    ]

    return {
      data: mockDrafts,
      total: mockDrafts.length,
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    }
  }, [])

  return (
    <div className={cn('p-3 sm:p-4', className)}>
      <div className='mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6'>
        {/* Header */}
        <div className='space-y-2'>
          <Typography variant='h1'>{t('title')}</Typography>
          <Typography variant='muted'>{t('description')}</Typography>
        </div>

        {/* Drafts List */}
        <List.Provider fetcher={draftsFetcher} defaultPerPage={10}>
          <DraftsList />
        </List.Provider>
      </div>
    </div>
  )
}
