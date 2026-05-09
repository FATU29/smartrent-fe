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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select'
import BrokerAvatar from '@/components/molecules/brokerAvatar'
import FollowButton from '@/components/molecules/followButton'
import PropertyCard from '@/components/molecules/propertyCard'
import PaginationControls from '@/components/molecules/paginationControls'
import { useFollowingFeed, useFollowingPeople } from '@/hooks/useUserFollow'
import { FollowedUser, ListingDetail } from '@/api/types'
import {
  buildApartmentDetailRoute,
  buildSellerDetailRoute,
} from '@/constants/route'
import { AlertCircle, Newspaper, ShieldCheck, Users2 } from 'lucide-react'

const PEOPLE_PAGE_SIZE = 20
const FEED_PAGE_SIZE = 12
// Sentinel for the "all followed users" filter option in the Select. Using a
// non-empty placeholder because Radix Select disallows empty-string values.
const FEED_FILTER_ALL = '__all__'

type ActiveTab = 'people' | 'feed'

const FollowingPageTemplate: React.FC = () => {
  const t = useTranslations('followingPage')
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('people')

  // People tab uses 0-based pagination on the backend (Spring Data Page).
  const [peoplePage, setPeoplePage] = React.useState(0)
  // Feed tab uses 1-based pagination because /v1/listings/* is 1-based throughout.
  const [feedPage, setFeedPage] = React.useState(1)
  // Selected followed user for the feed filter. Empty string = all.
  const [feedUserId, setFeedUserId] = React.useState<string>('')

  const peopleQuery = useFollowingPeople(peoplePage, PEOPLE_PAGE_SIZE)
  const feedQuery = useFollowingFeed(
    feedPage,
    FEED_PAGE_SIZE,
    feedUserId || undefined,
  )

  const people = peopleQuery.data?.content ?? []
  const peopleTotal = peopleQuery.data?.totalElements ?? 0
  const peopleTotalPages = peopleQuery.data?.totalPages ?? 0

  const feedListings = feedQuery.data?.listings ?? []
  const feedPagination = feedQuery.data?.pagination

  const handleViewFeed = React.useCallback(
    (userId: string) => {
      setFeedUserId(userId)
      setFeedPage(1)
      setActiveTab('feed')
      // Scroll up so the user immediately sees the new tab content.
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    [setFeedUserId, setFeedPage, setActiveTab],
  )

  const handleFeedFilterChange = React.useCallback(
    (value: string) => {
      setFeedUserId(value === FEED_FILTER_ALL ? '' : value)
      setFeedPage(1)
    },
    [setFeedUserId, setFeedPage],
  )

  // The filter dropdown lists the SAME set of people as tab 1's first page.
  // Anyone past page 1 of the people list is currently not selectable from
  // the dropdown — acceptable trade-off until users routinely follow >20.
  const filterPeople: FollowedUser[] = peopleQuery.data?.content ?? []
  const selectedPerson = filterPeople.find((p) => p.userId === feedUserId)
  const selectedPersonName = selectedPerson
    ? formatName(selectedPerson, t('defaultName'))
    : null

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

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ActiveTab)}
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
            <ErrorAlert t={t} onRetry={() => peopleQuery.refetch()} />
          )}

          {!peopleQuery.isLoading &&
            !peopleQuery.isError &&
            people.length === 0 && <EmptyPeopleState t={t} />}

          {people.length > 0 && (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4'>
              {people.map((person) => (
                <PersonCard
                  key={person.userId}
                  person={person}
                  defaultName={t('defaultName')}
                  proBrokerLabel={t('proBroker')}
                  viewFeedLabel={t('actions.viewFeed')}
                  onViewFeed={handleViewFeed}
                />
              ))}
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
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <div className='flex items-center gap-2 text-sm'>
              <Typography variant='small' className='text-muted-foreground'>
                {t('filters.label')}
              </Typography>
              <Select
                value={feedUserId || FEED_FILTER_ALL}
                onValueChange={handleFeedFilterChange}
              >
                <SelectTrigger className='h-9 w-full sm:w-64'>
                  <SelectValue placeholder={t('filters.allUsers')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FEED_FILTER_ALL}>
                    {t('filters.allUsers')}
                  </SelectItem>
                  {filterPeople.map((person) => (
                    <SelectItem key={person.userId} value={person.userId}>
                      {formatName(person, t('defaultName'))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPersonName && (
              <Badge
                variant='secondary'
                className='gap-1.5 self-start sm:self-auto'
              >
                <Newspaper className='h-3.5 w-3.5' />
                {t('filters.activeBadge', { name: selectedPersonName })}
              </Badge>
            )}
          </div>

          {feedQuery.isLoading && <FeedSkeleton />}

          {feedQuery.isError && (
            <ErrorAlert t={t} onRetry={() => feedQuery.refetch()} />
          )}

          {!feedQuery.isLoading &&
            !feedQuery.isError &&
            feedListings.length === 0 && (
              <EmptyFeedState t={t} filteredName={selectedPersonName} />
            )}

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

interface PersonCardProps {
  person: FollowedUser
  defaultName: string
  proBrokerLabel: string
  viewFeedLabel: string
  onViewFeed: (userId: string) => void
}

const PersonCard: React.FC<PersonCardProps> = ({
  person,
  defaultName,
  proBrokerLabel,
  viewFeedLabel,
  onViewFeed,
}) => {
  const name = formatName(person, defaultName)
  const isBroker =
    Boolean(person.isBroker) || person.brokerVerificationStatus === 'APPROVED'
  const profileUrl = buildSellerDetailRoute(person.userId)

  return (
    <Card className='overflow-hidden'>
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
              {proBrokerLabel}
            </span>
          )}

          <div className='mt-2 flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='h-8 px-3 text-xs gap-1.5'
              onClick={() => onViewFeed(person.userId)}
            >
              <Newspaper className='size-3.5' />
              {viewFeedLabel}
            </Button>
            <FollowButton
              targetUserId={person.userId}
              size='sm'
              className='h-8 px-3 text-xs'
            />
          </div>
        </div>
      </CardContent>
    </Card>
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

interface EmptyProps {
  t: ReturnType<typeof useTranslations>
}

const EmptyPeopleState: React.FC<EmptyProps> = ({ t }) => (
  <Card>
    <CardContent className='py-10 flex flex-col items-center text-center gap-3'>
      <Users2 className='h-10 w-10 text-muted-foreground' />
      <Typography variant='h4'>{t('empty.peopleTitle')}</Typography>
      <Typography variant='p' className='text-muted-foreground max-w-md'>
        {t('empty.peopleDescription')}
      </Typography>
      <Button asChild size='sm'>
        <Link href='/properties'>{t('empty.browseProperties')}</Link>
      </Button>
    </CardContent>
  </Card>
)

interface EmptyFeedProps extends EmptyProps {
  filteredName: string | null
}

const EmptyFeedState: React.FC<EmptyFeedProps> = ({ t, filteredName }) => (
  <Card>
    <CardContent className='py-10 flex flex-col items-center text-center gap-3'>
      <Typography variant='h4'>
        {filteredName
          ? t('empty.feedFilteredTitle', { name: filteredName })
          : t('empty.feedTitle')}
      </Typography>
      <Typography variant='p' className='text-muted-foreground max-w-md'>
        {filteredName
          ? t('empty.feedFilteredDescription', { name: filteredName })
          : t('empty.feedDescription')}
      </Typography>
    </CardContent>
  </Card>
)

function formatName(person: FollowedUser, fallback: string): string {
  const combined = `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim()
  return combined || fallback
}

export default FollowingPageTemplate
