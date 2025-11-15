import { useState, useMemo, useEffect } from 'react'
import { Customer, ListingWithCustomers } from '@/api/types/customer.type'
import { useMyCustomers, useMyListings } from '@/hooks/usePhoneClickDetails'

export const useCustomerManagement = (
  isMobile: boolean,
  initialCustomers: Customer[] = [],
) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'listings'>(
    'customers',
  )
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch customers (always enabled, uses server-side data as initial)
  const {
    data: customersData,
    isLoading: isCustomersLoading,
    isFetching: isCustomersFetching,
  } = useMyCustomers({
    initialData: initialCustomers.length > 0 ? initialCustomers : undefined,
    enabled: true,
  })

  // Fetch listings only when listings tab is active (client-side)
  const {
    data: listingsData,
    isLoading: isListingsLoading,
    isFetching: isListingsFetching,
  } = useMyListings({
    initialData: undefined, // Always fetch fresh from client-side
    enabled: activeTab === 'listings', // Only fetch when listings tab is active
  })

  const customers = customersData || initialCustomers
  const listings = listingsData || []

  // Loading states
  const isCustomersDataLoading = isCustomersLoading || isCustomersFetching
  const isListingsDataLoading = isListingsLoading || isListingsFetching
  const isDataLoading =
    activeTab === 'customers' ? isCustomersDataLoading : isListingsDataLoading

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  )
  const [selectedListing, setSelectedListing] =
    useState<ListingWithCustomers | null>(null)

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers
    const query = searchQuery.toLowerCase()
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query),
    )
  }, [searchQuery, customers])

  // Filter listings
  const filteredListings = useMemo(() => {
    if (!searchQuery) return listings
    const query = searchQuery.toLowerCase()
    return listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(query) ||
        listing.address.toLowerCase().includes(query) ||
        listing.interactions.some(
          (int) =>
            int.customerName.toLowerCase().includes(query) ||
            int.customerPhone.toLowerCase().includes(query),
        ),
    )
  }, [searchQuery, listings])

  const totalCustomers = customers.length
  const totalListings = listings.length

  // Auto-select first item on desktop if nothing is selected
  useEffect(() => {
    if (isMobile === false) {
      if (!selectedCustomer && customers.length > 0) {
        setSelectedCustomer(customers[0])
      }
      if (!selectedListing && listings.length > 0) {
        setSelectedListing(listings[0])
      }
    }
  }, [isMobile, selectedCustomer, selectedListing, customers, listings])

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCustomer,
    setSelectedCustomer,
    selectedListing,
    setSelectedListing,
    isLoading: isDataLoading,
    filteredCustomers,
    filteredListings,
    totalCustomers,
    totalListings,
  }
}
