import React, { useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { useListContext } from '@/contexts/list'
import { useListingsCursor } from '@/hooks/useListings'
import PropertyCard from '@/components/molecules/propertyCard'
import { PropertyCardSkeleton } from '@/components/molecules/propertyCard/PropertyCardSkeleton'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { ListingDetail } from '@/api/types'

const DEFAULT_CURSOR_PAGE_SIZE = 10

/**
 * Cursor (keyset) paginated property list — the load-more companion to the
 * offset-based {@link PropertyListContent}. It reads the live filter set from
 * the surrounding {@link ListProvider} (which is mounted WITHOUT a fetcher, so
 * the shared offset flow never runs) and pages purely through
 * {@link useListingsCursor}. Nothing in the shared list context is mutated, so
 * the numbered-pagination pages keep working untouched.
 */
const CursorPropertyList: React.FC = () => {
  const t = useTranslations('propertiesPage')
  const { filters } = useListContext<ListingDetail>()

  // Cursor paging keys off the filter set, not a page number. Drop `page` so
  // the filter bar's page resets don't churn the query; reuse `size` as the
  // per-fetch window.
  const { cursorFilters, pageSize } = useMemo(() => {
    const next = { ...filters }
    const size = next.size ?? DEFAULT_CURSOR_PAGE_SIZE
    delete next.page
    return { cursorFilters: next, pageSize: size }
  }, [filters])

  const {
    listings,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useListingsCursor(cursorFilters, { size: pageSize })

  const uniqueItems = useMemo(() => {
    const seen = new Set<string>()
    return listings.filter((property) => {
      const id = property.listingId
      if (!id) return false
      const key = String(id)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [listings])

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const clickedButton =
      target.closest('[data-action-button]') ||
      target.closest('button') ||
      target.closest('[role="button"]')

    if (clickedButton) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  if (isLoading && uniqueItems.length === 0) {
    return (
      <div className='space-y-3 md:space-y-4'>
        <PropertyCardSkeleton count={5} className='compact' imageLayout='top' />
      </div>
    )
  }

  if (isError && uniqueItems.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 py-12 text-center'>
        <Typography variant='h3'>{t('errorTitle')}</Typography>
        <Typography variant='p' className='text-muted-foreground'>
          {t('errorDescription')}
        </Typography>
        <Button variant='outline' onClick={() => refetch()}>
          {t('retry')}
        </Button>
      </div>
    )
  }

  if (uniqueItems.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <Typography variant='h3' className='mb-4'>
          {t('noProperties')}
        </Typography>
        <Typography variant='p' className='text-muted-foreground'>
          {t('noPropertiesDescription')}
        </Typography>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-4 md:space-y-5'>
        {uniqueItems.map((property) => (
          <Link
            key={property.listingId}
            href={`/listing-detail/${property.listingId}`}
            className='block transition-transform duration-200 active:scale-[0.99]'
            onClick={handleLinkClick}
          >
            <PropertyCard
              listing={property}
              className='compact'
              imageLayout='top'
            />
          </Link>
        ))}

        {isFetchingNextPage && (
          <PropertyCardSkeleton
            count={3}
            className='compact'
            imageLayout='top'
          />
        )}
      </div>

      {hasNextPage && (
        <div className='flex justify-center pt-2'>
          <Button
            variant='outline'
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className='min-w-[180px]'
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                {t('loadingMore')}
              </>
            ) : (
              t('loadMore')
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default CursorPropertyList
