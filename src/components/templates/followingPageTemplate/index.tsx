import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/atoms/card'
import { Skeleton } from '@/components/atoms/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/alert'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { PageContainer } from '@/components/atoms/pageContainer'
import PropertyCard from '@/components/molecules/propertyCard'
import PaginationControls from '@/components/molecules/paginationControls'
import { useFollowingFeed, useFollowingPeople } from '@/hooks/useUserFollow'
import { ListingDetail } from '@/api/types'
import { buildApartmentDetailRoute } from '@/constants/route'
import { AlertCircle, Newspaper, Users2 } from 'lucide-react'

const PEOPLE_PAGE_SIZE = 20
const FEED_PAGE_SIZE = 12

const FollowingPageTemplate: React.FC = () => {
  const t = useTranslations('followingPage')

  // Feed uses 1-based pagination because /v1/listings/* is 1-based throughout.
  const [feedPage, setFeedPage] = React.useState(1)

  // The feed always shows every followed person's listings — no per-person
  // filtering, so users see their posts without having to pick anyone.
  const feedQuery = useFollowingFeed(feedPage, FEED_PAGE_SIZE)
  // Fetched only for the "people you follow" count badge.
  const peopleQuery = useFollowingPeople(0, PEOPLE_PAGE_SIZE)

  const peopleTotal = peopleQuery.data?.totalElements ?? 0
  const feedListings = feedQuery.data?.listings ?? []
  const feedPagination = feedQuery.data?.pagination

  return (
    <PageContainer width='content' className='py-6'>
      <div className='mb-6 flex items-end justify-between gap-3 flex-wrap'>
        <div>
          <Typography variant='pageTitle'>{t('title')}</Typography>
          <Typography variant='p' className='text-muted-foreground mt-1'>
            {t('subtitle')}
          </Typography>
        </div>
        <Badge variant='outline' className='gap-1.5'>
          <Users2 className='h-3.5 w-3.5' />
          {t('peopleCount', { count: peopleTotal })}
        </Badge>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center gap-2 min-w-0'>
          <Newspaper className='h-4 w-4 text-muted-foreground shrink-0' />
          <Typography variant='h5' className='truncate font-semibold text-base'>
            {t('filters.allFeedHeading')}
          </Typography>
        </div>

        {feedQuery.isPending && !feedQuery.isError && <FeedSkeleton />}

        {feedQuery.isError && (
          <ErrorAlert t={t} onRetry={() => feedQuery.refetch()} />
        )}

        {!feedQuery.isPending &&
          !feedQuery.isError &&
          feedListings.length === 0 && <EmptyFeedState t={t} />}

        {feedListings.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
            {feedListings.map((listing: ListingDetail) => (
              <Link
                key={listing.listingId}
                href={buildApartmentDetailRoute(listing.listingId.toString())}
                className='block'
              >
                <PropertyCard listing={listing} imageLayout='top' />
              </Link>
            ))}
          </div>
        )}

        {feedPagination && feedPagination.totalPages > 1 && (
          <PaginationControls
            className='pt-2'
            pagination={{
              currentPage: feedPage,
              pageSize: FEED_PAGE_SIZE,
              totalItems: feedPagination.totalCount,
              totalPages: feedPagination.totalPages,
            }}
            currentSize={FEED_PAGE_SIZE}
            showPerPageSelector={false}
            onPageChange={(page) => setFeedPage(Math.max(1, page))}
            onSizeChange={() => undefined}
          />
        )}
      </div>
    </PageContainer>
  )
}

const FeedSkeleton: React.FC = () => (
  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
    {Array.from({ length: 6 }).map((_, idx) => (
      <Skeleton key={idx} className='h-72 w-full rounded-xl' />
    ))}
  </div>
)

interface AlertProps {
  t: ReturnType<typeof useTranslations>
  onRetry: () => void
}

const ErrorAlert: React.FC<AlertProps> = ({ t, onRetry }) => (
  <Alert variant='destructive'>
    <AlertCircle className='h-4 w-4' />
    <AlertTitle>{t('states.errorTitle')}</AlertTitle>
    <AlertDescription>
      <div className='flex flex-col gap-3'>
        <p>{t('states.errorDescription')}</p>
        <Button size='sm' variant='outline' onClick={onRetry} className='w-fit'>
          {t('actions.retry')}
        </Button>
      </div>
    </AlertDescription>
  </Alert>
)

interface EmptyFeedProps {
  t: ReturnType<typeof useTranslations>
}

const EmptyFeedState: React.FC<EmptyFeedProps> = ({ t }) => (
  <Card>
    <CardContent className='py-10 flex flex-col items-center text-center gap-3'>
      <Typography variant='h4'>{t('empty.feedTitle')}</Typography>
      <Typography variant='p' className='text-muted-foreground max-w-md'>
        {t('empty.feedDescription')}
      </Typography>
      <Button asChild size='sm'>
        <Link href='/properties'>{t('empty.browseProperties')}</Link>
      </Button>
    </CardContent>
  </Card>
)

export default FollowingPageTemplate
