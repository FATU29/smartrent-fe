import React from 'react'
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
import { useCustomerManagement } from './hooks/useCustomerManagement'

const CustomerManagementTemplate: React.FC = () => {
  const t = useTranslations('seller.customers')
  const { language } = useSwitchLanguage()
  const { isMobile, dialogOpen, openDialog, setDialogOpen } =
    useMobileCustomerDialog()

  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCustomer,
    setSelectedCustomer,
    selectedListing,
    setSelectedListing,
    isLoading,
    filteredCustomers,
    filteredListings,
    unviewedCustomersCount,
    unviewedListingsCount,
    totalCustomers,
    totalListings,
  } = useCustomerManagement(!!isMobile)

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    // Mark as viewed
    customer.hasUnviewed = false
    openDialog()
  }

  const handleListingSelect = (listing: ListingWithCustomers) => {
    setSelectedListing(listing)
    // Mark all interactions as viewed
    listing.interactions.forEach((int) => {
      int.viewed = true
    })
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
              <StatsDisplay
                totalCount={totalCustomers + totalListings}
                unviewedCount={unviewedCustomersCount + unviewedListingsCount}
              />
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
              unviewedCustomersCount={unviewedCustomersCount}
              unviewedListingsCount={unviewedListingsCount}
            />

            {/* Customers Tab */}
            <TabsContent
              value='customers'
              className='flex-1 overflow-y-auto p-4 space-y-3 mt-0 max-h-[calc(100vh-280px)]'
            >
              <CustomerList
                customers={filteredCustomers}
                selectedCustomerId={selectedCustomer?.id || null}
                isLoading={isLoading}
                onCustomerSelect={handleCustomerSelect}
              />
            </TabsContent>

            {/* Listings Tab */}
            <TabsContent
              value='listings'
              className='flex-1 overflow-y-auto p-4 space-y-3 mt-0 max-h-[calc(100vh-280px)]'
            >
              <ListingList
                listings={filteredListings}
                selectedListingId={selectedListing?.id || null}
                isLoading={isLoading}
                language={language}
                onListingSelect={handleListingSelect}
              />
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
