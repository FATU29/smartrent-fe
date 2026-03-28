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

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
          {t('title')}
        </h1>
        <p className='text-muted-foreground mt-1'>{t('description')}</p>
      </div>

      {/* Membership Section */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <DashboardMembershipCard />
        </div>
        <div className='lg:col-span-1'>
          <DashboardMembershipNavCard />
        </div>
      </div>

      {/* Phone Click Statistics */}
      <div id='phone-click-analytics' className='space-y-6'>
        <div>
          <h2
            id='phone-click-analytics-title'
            className='text-xl font-semibold tracking-tight scroll-mt-24'
          >
            {t('phoneClickStats.title')}
          </h2>
          <p className='text-sm text-muted-foreground mt-1'>
            {t('phoneClickStats.description')}
          </p>
        </div>

        {/* Stats Cards */}
        <DashboardPhoneClickStats
          analytics={selectedListingAnalytics}
          isLoading={isSummaryLoading || isDetailLoading}
        />

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
        <div>
          <h2
            id='saved-listings-analytics-title'
            className='text-xl font-semibold tracking-tight scroll-mt-24'
          >
            {t('savedListingsStats.title')}
          </h2>
          <p className='text-sm text-muted-foreground mt-1'>
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
