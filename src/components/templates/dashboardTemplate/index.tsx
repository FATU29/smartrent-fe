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

const DashboardTemplate: React.FC = () => {
  const t = useTranslations('seller.dashboard')
  const { data: listings = [], isLoading: isSummaryLoading } =
    useOwnerListingsAnalyticsSummary()
  const [selectedListingId, setSelectedListingId] = React.useState<
    number | null
  >(null)

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
    useOwnerListingAnalytics(selectedListingId)

  const { data: savedListingsSummary, isLoading: isSavedSummaryLoading } =
    useOwnerSavedListingsAnalyticsSummary()
  const savedListings = savedListingsSummary?.listings || []
  const [selectedSavedListingId, setSelectedSavedListingId] = React.useState<
    number | null
  >(null)

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
      (listing) => listing.listingId === selectedSavedListingId,
    )

    if (!stillExists) {
      setSelectedSavedListingId(savedListings[0].listingId)
    }
  }, [savedListings, selectedSavedListingId])

  const { data: selectedSavedListingTrend, isLoading: isSavedTrendLoading } =
    useOwnerListingSavesTrend(selectedSavedListingId)

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
          listings={listings}
          selectedListingId={selectedListingId}
          analytics={selectedListingAnalytics}
          isSummaryLoading={isSummaryLoading}
          isDetailLoading={isDetailLoading}
          onSelectListing={setSelectedListingId}
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
          totalSavesAcrossAll={savedListingsSummary?.totalSavesAcrossAll || 0}
          selectedListingId={selectedSavedListingId}
          trend={selectedSavedListingTrend}
          isSummaryLoading={isSavedSummaryLoading}
          isDetailLoading={isSavedTrendLoading}
          onSelectListing={setSelectedSavedListingId}
        />
      </div>
    </div>
  )
}

export default DashboardTemplate
