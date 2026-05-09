import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/atoms/tabs'
import { Card, CardContent } from '@/components/atoms/card'
import { Skeleton } from '@/components/atoms/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/alert'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { PageContainer } from '@/components/atoms/pageContainer'
import BrokerAvatar from '@/components/molecules/brokerAvatar'
import FollowButton from '@/components/molecules/followButton'
import PropertyCard from '@/components/molecules/propertyCard'
import PaginationControls from '@/components/molecules/paginationControls'
import { useFollowingFeed, useFollowingPeople } from '@/hooks/useUserFollow'
import { ListingDetail } from '@/api/types'
import {
  buildApartmentDetailRoute,
  buildSellerDetailRoute,
} from '@/constants/route'
import { AlertCircle, ShieldCheck, Users2 } from 'lucide-react'

const PEOPLE_PAGE_SIZE = 20
const FEED_PAGE_SIZE = 12

const FollowingPageTemplate: React.FC = () => {
  const t = useTranslations('followingPage')
  const [activeTab, setActiveTab] = React.useState<'people' | 'feed'>('people')

  // People tab uses 0-based pagination on the backend (Spring Data Page).
  const [peoplePage, setPeoplePage] = React.useState(0)
  // Feed tab uses 1-based pagination because /v1/listings/* is 1-based throughout.
  const [feedPage, setFeedPage] = React.useState(1)

  const peopleQuery = useFollowingPeople(peoplePage, PEOPLE_PAGE_SIZE)
  const feedQuery = useFollowingFeed(feedPage, FEED_PAGE_SIZE)

  const people = peopleQuery.data?.content ?? []
  const peopleTotal = peopleQuery.data?.totalElements ?? 0
  const peopleTotalPages = peopleQuery.data?.totalPages ?? 0

  const feedListings = feedQuery.data?.listings ?? []
  const feedPagination = feedQuery.data?.pagination

  return (
    <PageContainer width='content' className='py-6'>
      <div className='mb-6 flex items-end justify-between gap-3 flex-wrap'>
        <div>
          <Typography variant='h2' className='text-xl md:text-2xl'>
            {t('title')}
          </Typography>
          <Typography variant='p' className='text-muted-foreground mt-1'>
            {t('subtitle')}
          </Typography>
        </div>
        <Badge variant='outline' className='gap-1.5'>
          <Users2 className='h-3.5 w-3.5' />
          {t('peopleCount', { count: peopleTotal })}
        </Badge>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'people' | 'feed')}
        className='space-y-5'
      >
        <TabsList className='grid w-full md:w-fit grid-cols-2'>
          <TabsTrigger value='people' className='px-4'>
            {t('tabs.people')}
          </TabsTrigger>
          <TabsTrigger value='feed' className='px-4'>
            {t('tabs.feed')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='people' className='space-y-4'>
          {peopleQuery.isLoading && <PeopleSkeleton />}

          {peopleQuery.isError && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>{t('states.errorTitle')}</AlertTitle>
              <AlertDescription>
                <div className='flex flex-col gap-3'>
                  <p>{t('states.errorDescription')}</p>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => peopleQuery.refetch()}
                    className='w-fit'
                  >
                    {t('actions.retry')}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!peopleQuery.isLoading &&
            !peopleQuery.isError &&
            people.length === 0 && <EmptyPeopleState t={t} />}

          {people.length > 0 && (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4'>
              {people.map((person) => {
                const name =
                  `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim() ||
                  t('defaultName')
                const isBroker =
                  Boolean(person.isBroker) ||
                  person.brokerVerificationStatus === 'APPROVED'
                const profileUrl = buildSellerDetailRoute(person.userId)

                return (
                  <Card key={person.userId} className='overflow-hidden'>
                    <CardContent className='p-4 flex items-start gap-3'>
                      <Link href={profileUrl} className='shrink-0'>
                        <BrokerAvatar
                          avatarUrl={person.avatarUrl ?? undefined}
                          firstName={person.firstName ?? ''}
                          lastName={person.lastName ?? ''}
                          alt={name}
                          sizeClassName='h-12 w-12 md:h-14 md:w-14'
                          showBrokerBadge={isBroker}
                          fallbackClassName='text-sm md:text-base'
                          badgeClassName='h-5 w-5 md:h-6 md:w-6'
                        />
                      </Link>

                      <div className='flex-1 min-w-0'>
                        <Link
                          href={profileUrl}
                          className='block min-w-0 hover:text-primary transition-colors'
                        >
                          <Typography
                            variant='h5'
                            className='font-semibold truncate text-sm md:text-base leading-tight'
                          >
                            {name}
                          </Typography>
                        </Link>

                        {isBroker && (
                          <span className='mt-0.5 inline-flex items-center gap-1 text-2xs md:text-xs text-emerald-700 dark:text-emerald-300'>
                            <ShieldCheck className='h-3 w-3' />
                            {t('proBroker')}
                          </span>
                        )}

                        <div className='mt-2 flex flex-wrap items-center gap-2'>
                          <Button
                            asChild
                            size='sm'
                            variant='outline'
                            className='h-8 px-3 text-xs'
                          >
                            <Link href={profileUrl}>
                              {t('actions.viewListings')}
                            </Link>
                          </Button>
                          <FollowButton
                            targetUserId={person.userId}
                            variant='compact'
                            fullWidth={false}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {peopleTotalPages > 1 && (
            <PaginationControls
              className='pt-2'
              pagination={{
                currentPage: peoplePage + 1,
                pageSize: PEOPLE_PAGE_SIZE,
                totalItems: peopleTotal,
                totalPages: peopleTotalPages,
              }}
              currentSize={PEOPLE_PAGE_SIZE}
              showPerPageSelector={false}
              onPageChange={(page) => setPeoplePage(Math.max(0, page - 1))}
              onSizeChange={() => undefined}
            />
          )}
        </TabsContent>

        <TabsContent value='feed' className='space-y-4'>
          {feedQuery.isLoading && <FeedSkeleton />}

          {feedQuery.isError && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>{t('states.errorTitle')}</AlertTitle>
              <AlertDescription>
                <div className='flex flex-col gap-3'>
                  <p>{t('states.errorDescription')}</p>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => feedQuery.refetch()}
                    className='w-fit'
                  >
                    {t('actions.retry')}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!feedQuery.isLoading &&
            !feedQuery.isError &&
            feedListings.length === 0 && <EmptyFeedState t={t} />}

          {feedListings.length > 0 && (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
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
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

const PeopleSkeleton: React.FC = () => (
  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4'>
    {Array.from({ length: 4 }).map((_, idx) => (
      <Card key={idx} className='overflow-hidden'>
        <CardContent className='p-4 flex items-start gap-3'>
          <Skeleton className='h-12 w-12 md:h-14 md:w-14 rounded-full' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-4 w-40' />
            <Skeleton className='h-3 w-24' />
            <div className='flex gap-2 pt-1'>
              <Skeleton className='h-8 w-24' />
              <Skeleton className='h-8 w-24' />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

const FeedSkeleton: React.FC = () => (
  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
    {Array.from({ length: 6 }).map((_, idx) => (
      <Skeleton key={idx} className='h-72 w-full rounded-xl' />
    ))}
  </div>
)

interface EmptyProps {
  t: ReturnType<typeof useTranslations>
}

const EmptyPeopleState: React.FC<EmptyProps> = ({ t }) => (
  <Card>
    <CardContent className='py-10 flex flex-col items-center text-center gap-3'>
      <Users2 className='h-10 w-10 text-muted-foreground' />
      <Typography variant='h4' className='text-base md:text-lg'>
        {t('empty.peopleTitle')}
      </Typography>
      <Typography variant='p' className='text-muted-foreground max-w-md'>
        {t('empty.peopleDescription')}
      </Typography>
      <Button asChild size='sm'>
        <Link href='/properties'>{t('empty.browseProperties')}</Link>
      </Button>
    </CardContent>
  </Card>
)

const EmptyFeedState: React.FC<EmptyProps> = ({ t }) => (
  <Card>
    <CardContent className='py-10 flex flex-col items-center text-center gap-3'>
      <Typography variant='h4' className='text-base md:text-lg'>
        {t('empty.feedTitle')}
      </Typography>
      <Typography variant='p' className='text-muted-foreground max-w-md'>
        {t('empty.feedDescription')}
      </Typography>
    </CardContent>
  </Card>
)

export default FollowingPageTemplate
