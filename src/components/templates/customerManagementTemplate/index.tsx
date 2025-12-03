import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent } from '@/components/atoms/tabs'
import { SearchInput } from '@/components/atoms/search-input'
import CustomerDetailPanel from '@/components/organisms/customerManagement/customerDetailPanel'
import ListingDetailPanel from '@/components/organisms/customerManagement/listingDetailPanel'
import { Customer, ListingWithCustomers } from '@/api/types/customer.type'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
import MobileDetailDialog from '@/components/molecules/customerManagement/mobileDetailDialog'
import { useMobileCustomerDialog } from '@/components/molecules/customerManagement/hooks/useMobileCustomerDialog'
import StatsDisplay from '@/components/molecules/customerManagement/statsDisplay'
import DetailEmptyState from '@/components/molecules/customerManagement/detailEmptyState'
import TabHeader from '@/components/molecules/customerManagement/tabHeader'
import CustomerList from '@/components/molecules/customerManagement/customerList'
import ListingList from '@/components/molecules/customerManagement/listingList'
import CustomerManagementSkeleton from '@/components/molecules/customerManagement/customerManagementSkeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { useCustomerManagement } from './hooks/useCustomerManagement'
import { Loader2 } from 'lucide-react'

const CustomerManagementTemplate: React.FC = () => {
  const t = useTranslations('seller.customers')
  const { language } = useSwitchLanguage()
  const { isMobile, dialogOpen, openDialog, setDialogOpen } =
    useMobileCustomerDialog()

  // Local search query state
  const [searchQuery, setSearchQuery] = useState('')

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const {
    activeTab,
    setActiveTab,
    selectedCustomer,
    setSelectedCustomer,
    selectedListing,
    setSelectedListing,
    isLoading,
    filteredCustomers,
    filteredListings,
    totalCustomers,
    totalListings,
    loadMore,
    hasMore,
    isFetchingMore,
  } = useCustomerManagement({
    isMobile: !!isMobile,
    searchTitle: debouncedSearchQuery,
  })

  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: () => {
      if (hasMore && !isFetchingMore) {
        loadMore()
      }
    },
    options: {
      threshold: 0.1,
    },
  })

  // Show skeleton on initial load
  if (isLoading && activeTab === 'customers') {
    return <CustomerManagementSkeleton />
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    openDialog()
  }

  const handleListingSelect = (listing: ListingWithCustomers) => {
    setSelectedListing(listing)
    openDialog()
  }

  return (
    <div className='h-full flex flex-col bg-background'>
      <div className='flex-1 flex overflow-hidden w-full'>
        {/* Left Panel */}
        <div className='w-full lg:w-1/2 border-r bg-white flex flex-col'>
          {/* Search with Stats */}
          <div className='p-4 border-b'>
            <div className='flex flex-col mb:flex-row items-center gap-4'>
              <div className='flex-1'>
                <SearchInput
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(value) => setSearchQuery(value)}
                />
              </div>
              <StatsDisplay totalCount={totalCustomers + totalListings} />
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as 'customers' | 'listings')
            }
            className='flex-1 flex flex-col'
          >
            <TabHeader
              totalCustomers={totalCustomers}
              totalListings={totalListings}
            />

            {/* Customers Tab */}
            <TabsContent
              value='customers'
              className='flex-1 overflow-y-auto p-4 space-y-3 mt-0 max-h-[calc(100vh-280px)]'
            >
              <CustomerList
                customers={filteredCustomers}
                selectedCustomerId={selectedCustomer?.id || null}
                isLoading={isLoading && activeTab === 'customers'}
                onCustomerSelect={handleCustomerSelect}
              />

              {/* Infinite scroll trigger */}
              {hasMore && activeTab === 'customers' && (
                <div
                  ref={loadMoreRef as React.RefObject<HTMLDivElement>}
                  className='flex justify-center py-4'
                >
                  {isFetchingMore && (
                    <Loader2 className='h-6 w-6 animate-spin text-primary' />
                  )}
                </div>
              )}
            </TabsContent>

            {/* Listings Tab */}
            <TabsContent
              value='listings'
              className='flex-1 overflow-y-auto p-4 space-y-3 mt-0 max-h-[calc(100vh-280px)]'
            >
              <ListingList
                listings={filteredListings}
                selectedListingId={selectedListing?.id || null}
                isLoading={isLoading && activeTab === 'listings'}
                language={language}
                onListingSelect={handleListingSelect}
              />

              {/* Infinite scroll trigger */}
              {hasMore && activeTab === 'listings' && (
                <div
                  ref={loadMoreRef as React.RefObject<HTMLDivElement>}
                  className='flex justify-center py-4'
                >
                  {isFetchingMore && (
                    <Loader2 className='h-6 w-6 animate-spin text-primary' />
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Detail View (Desktop only) */}
        <div className='hidden lg:flex lg:w-1/2 bg-muted/30'>
          {activeTab === 'customers' && selectedCustomer ? (
            <CustomerDetailPanel customer={selectedCustomer} />
          ) : activeTab === 'listings' && selectedListing ? (
            <ListingDetailPanel listing={selectedListing} language={language} />
          ) : (
            <DetailEmptyState activeTab={activeTab} />
          )}
        </div>
      </div>

      {/* Mobile Dialog - Full Screen Detail View */}
      <MobileDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        activeTab={activeTab}
        selectedCustomer={selectedCustomer}
        selectedListing={selectedListing}
        language={language}
      />
    </div>
  )
}

export default CustomerManagementTemplate
