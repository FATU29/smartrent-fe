import React from 'react'
import { useTranslations } from 'next-intl'
import DashboardMembershipCard from '@/components/molecules/dashboardMembershipCard'
import DashboardPhoneClickStats from '@/components/molecules/dashboardPhoneClickStats'
import DashboardPhoneClickChart from '@/components/molecules/dashboardPhoneClickChart'
import DashboardSavedListingsChart from '@/components/molecules/dashboardSavedListingsChart'
import DashboardMembershipNavCard from '@/components/molecules/dashboardMembershipNavCard'
import {
  useOwnerListingAnalytics,
  useOwnerListingsAnalyticsSummary,
} from '@/hooks/usePhoneClickDetails'
import {
  useOwnerListingSavesTrend,
  useOwnerSavedListingsAnalyticsSummary,
} from '@/hooks/useSavedListings'
import { useOwnerSavedListingsAnalyticsPage } from '@/hooks/useSavedListings/useOwnerSavedListingsAnalytics'
import { useDebounce } from '@/hooks/useDebounce'
import { useOwnerListingsAnalyticsPage } from '@/hooks/usePhoneClickDetails/useOwnerListingAnalytics'
import { Card, CardContent, CardHeader } from '@/components/atoms/card'
import { Skeleton } from '@/components/atoms/skeleton'

const MEMBERSHIP_INTRO_STORAGE_KEY = 'seller-dashboard-membership-intro-seen'
const MEMBERSHIP_INTRO_DURATION_MS = 900

const MembershipSectionSkeleton: React.FC = () => {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      <Card className='lg:col-span-2'>
        <CardHeader className='space-y-2'>
          <Skeleton className='h-6 w-52' />
          <Skeleton className='h-4 w-40' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-20 w-full rounded-lg' />
          <Skeleton className='h-16 w-full rounded-lg' />
          <Skeleton className='h-16 w-full rounded-lg' />
          <Skeleton className='h-11 w-full rounded-lg' />
        </CardContent>
      </Card>

      <Card className='lg:col-span-1'>
        <CardHeader className='space-y-2'>
          <Skeleton className='h-6 w-40' />
          <Skeleton className='h-4 w-full' />
        </CardHeader>
        <CardContent className='space-y-3'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-[80%]' />
          <Skeleton className='h-11 w-full rounded-lg' />
        </CardContent>
      </Card>
    </div>
  )
}

const DashboardTemplate: React.FC = () => {
  const t = useTranslations('seller.dashboard')
  const { data: listings = [], isLoading: isSummaryLoading } =
    useOwnerListingsAnalyticsSummary()
  const [selectedListingId, setSelectedListingId] = React.useState<
    number | null
  >(null)
  const [clicksPeriod, setClicksPeriod] = React.useState<
    '7d' | '30d' | '90d' | '180d' | '365d' | 'all'
  >('30d')
  const [clicksPage, setClicksPage] = React.useState(0)
  const [clicksSize, setClicksSize] = React.useState(10)
  const [clicksKeyword, setClicksKeyword] = React.useState('')
  const debouncedClicksKeyword = useDebounce(clicksKeyword, 300)
  const { data: clicksListingsPage, isLoading: isClicksPageLoading } =
    useOwnerListingsAnalyticsPage({
      page: clicksPage,
      size: clicksSize,
      keyword: debouncedClicksKeyword,
    })
  const pagedClickListings = Array.from(
    clicksListingsPage?.listings || listings,
  )

  React.useEffect(() => {
    if (listings.length === 0) {
      if (selectedListingId !== null) {
        setSelectedListingId(null)
      }
      return
    }

    if (!selectedListingId) {
      setSelectedListingId(listings[0].listingId)
      return
    }

    const stillExists = listings.some(
      (listing) => listing.listingId === selectedListingId,
    )

    if (!stillExists) {
      setSelectedListingId(listings[0].listingId)
    }
  }, [listings, selectedListingId])

  const { data: selectedListingAnalytics, isLoading: isDetailLoading } =
    useOwnerListingAnalytics(selectedListingId, clicksPeriod)

  const [showMembershipIntroLoader, setShowMembershipIntroLoader] =
    React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const hasSeenIntro =
      window.sessionStorage.getItem(MEMBERSHIP_INTRO_STORAGE_KEY) === '1'

    if (hasSeenIntro) return

    setShowMembershipIntroLoader(true)
    const timer = window.setTimeout(() => {
      setShowMembershipIntroLoader(false)
      window.sessionStorage.setItem(MEMBERSHIP_INTRO_STORAGE_KEY, '1')
    }, MEMBERSHIP_INTRO_DURATION_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  const { data: savedListingsSummary, isLoading: isSavedSummaryLoading } =
    useOwnerSavedListingsAnalyticsSummary()
  // paging + search state for saved listings
  const [savesPage, setSavesPage] = React.useState(0)
  const [savesSize, setSavesSize] = React.useState(10)
  const [savesKeyword, setSavesKeyword] = React.useState('')
  const debouncedSavesKeyword = useDebounce(savesKeyword, 300)
  const { data: savedListingsPage, isLoading: isSavedPageLoading } =
    useOwnerSavedListingsAnalyticsPage({
      page: savesPage,
      size: savesSize,
      keyword: debouncedSavesKeyword,
    })
  const savedListings = savedListingsPage?.listings || []
  const [selectedSavedListingId, setSelectedSavedListingId] = React.useState<
    number | null
  >(null)
  const [savesPeriod, setSavesPeriod] = React.useState<
    '7d' | '30d' | '90d' | '180d' | '365d' | 'all'
  >('30d')

  React.useEffect(() => {
    if (savedListings.length === 0) {
      if (selectedSavedListingId !== null) {
        setSelectedSavedListingId(null)
      }
      return
    }

    if (!selectedSavedListingId) {
      setSelectedSavedListingId(savedListings[0].listingId)
      return
    }

    const stillExists = savedListings.some(
      (listing: { listingId: number }) =>
        listing.listingId === selectedSavedListingId,
    )

    if (!stillExists) {
      setSelectedSavedListingId(savedListings[0].listingId)
    }
  }, [savedListings, selectedSavedListingId])

  const { data: selectedSavedListingTrend, isLoading: isSavedTrendLoading } =
    useOwnerListingSavesTrend(selectedSavedListingId, savesPeriod)

  const hasPhoneClickAnalyticsData = React.useMemo(() => {
    if (!selectedListingAnalytics) return false

    const hasSummaryMetrics =
      selectedListingAnalytics.totalClicks > 0 ||
      selectedListingAnalytics.totalViews > 0
    const hasTrendData = selectedListingAnalytics.clicksOverTime.some(
      (item) => item.count > 0,
    )
    const hasDayData = Object.values(
      selectedListingAnalytics.clicksByDayOfWeek || {},
    ).some((count) => count > 0)

    return hasSummaryMetrics || hasTrendData || hasDayData
  }, [selectedListingAnalytics])

  return (
    <div className='space-y-7'>
      {/* Header */}
      <div className='space-y-1.5'>
        <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
          {t('title')}
        </h1>
        <p className='max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]'>
          {t('description')}
        </p>
      </div>

      {/* Membership Section */}
      {showMembershipIntroLoader ? (
        <MembershipSectionSkeleton />
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2'>
            <DashboardMembershipCard />
          </div>
          <div className='lg:col-span-1'>
            <DashboardMembershipNavCard />
          </div>
        </div>
      )}

      {/* Phone Click Statistics */}
      <div id='phone-click-analytics' className='space-y-6'>
        <div className='space-y-1.5'>
          <h2
            id='phone-click-analytics-title'
            className='scroll-mt-24 text-xl font-semibold tracking-tight sm:text-2xl'
          >
            {t('phoneClickStats.title')}
          </h2>
          <p className='max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]'>
            {t('phoneClickStats.description')}
          </p>
        </div>

        {/* Stats Cards */}
        {(isSummaryLoading ||
          isDetailLoading ||
          hasPhoneClickAnalyticsData) && (
          <DashboardPhoneClickStats
            analytics={
              hasPhoneClickAnalyticsData ? selectedListingAnalytics : null
            }
            isLoading={isSummaryLoading || isDetailLoading}
          />
        )}

        {/* Chart */}
        <DashboardPhoneClickChart
          listings={pagedClickListings}
          selectedListingId={selectedListingId}
          analytics={selectedListingAnalytics}
          isSummaryLoading={isSummaryLoading || isClicksPageLoading}
          isDetailLoading={isDetailLoading}
          onSelectListing={setSelectedListingId}
          currentPage={clicksListingsPage?.currentPage}
          totalPages={clicksListingsPage?.totalPages}
          totalElements={clicksListingsPage?.totalElements}
          pageSize={clicksListingsPage?.pageSize}
          onPageChange={(p) => setClicksPage(Math.max(0, p))}
          onPageSizeChange={(s) => {
            setClicksSize(s)
            setClicksPage(0)
          }}
          searchKeyword={clicksKeyword}
          onSearchKeywordChange={(kw) => {
            setClicksKeyword(kw)
            setClicksPage(0)
          }}
          period={clicksPeriod}
          onPeriodChange={setClicksPeriod}
        />
      </div>

      {/* Saved Listings Statistics */}
      <div id='saved-listings-analytics' className='space-y-6'>
        <div className='space-y-1.5'>
          <h2
            id='saved-listings-analytics-title'
            className='scroll-mt-24 text-xl font-semibold tracking-tight sm:text-2xl'
          >
            {t('savedListingsStats.title')}
          </h2>
          <p className='max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]'>
            {t('savedListingsStats.description')}
          </p>
        </div>

        <DashboardSavedListingsChart
          listings={savedListings}
          totalSavesAcrossAll={
            savedListingsPage?.totalSavesAcrossAll ||
            savedListingsSummary?.totalSavesAcrossAll ||
            0
          }
          selectedListingId={selectedSavedListingId}
          trend={selectedSavedListingTrend}
          isSummaryLoading={isSavedSummaryLoading || isSavedPageLoading}
          isDetailLoading={isSavedTrendLoading}
          onSelectListing={setSelectedSavedListingId}
          currentPage={savedListingsPage?.currentPage}
          totalPages={savedListingsPage?.totalPages}
          totalElements={savedListingsPage?.totalElements}
          pageSize={savedListingsPage?.pageSize}
          onPageChange={(p) => setSavesPage(Math.max(0, p))}
          onPageSizeChange={(s) => {
            setSavesSize(s)
            setSavesPage(0)
          }}
          searchKeyword={savesKeyword}
          onSearchKeywordChange={(kw) => {
            setSavesKeyword(kw)
            setSavesPage(0)
          }}
          period={savesPeriod}
          onPeriodChange={setSavesPeriod}
        />
      </div>
    </div>
  )
}

export default DashboardTemplate
