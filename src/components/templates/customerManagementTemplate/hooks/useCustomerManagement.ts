import { useState, useMemo, useEffect } from 'react'
import { Customer, ListingWithCustomers } from '@/api/types/customer.type'
import {
  mockCustomers,
  mockListingsWithCustomers,
} from '@/components/molecules/customerManagement/index.helper'

export const useCustomerManagement = (isMobile: boolean) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'listings'>(
    'customers',
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  )
  const [selectedListing, setSelectedListing] =
    useState<ListingWithCustomers | null>(null)
  const [isLoading] = useState(false)

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return mockCustomers
    const query = searchQuery.toLowerCase()
    return mockCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query),
    )
  }, [searchQuery])

  // Filter listings
  const filteredListings = useMemo(() => {
    if (!searchQuery) return mockListingsWithCustomers
    const query = searchQuery.toLowerCase()
    return mockListingsWithCustomers.filter(
      (listing) =>
        listing.title.toLowerCase().includes(query) ||
        listing.address.toLowerCase().includes(query) ||
        listing.interactions.some(
          (int) =>
            int.customerName.toLowerCase().includes(query) ||
            int.customerPhone.toLowerCase().includes(query),
        ),
    )
  }, [searchQuery])

  // Count unviewed
  const unviewedCustomersCount = mockCustomers.filter(
    (c) => c.hasUnviewed,
  ).length
  const unviewedListingsCount = mockListingsWithCustomers.filter((l) =>
    l.interactions.some((int) => !int.viewed),
  ).length

  const totalCustomers = mockCustomers.length
  const totalListings = mockListingsWithCustomers.length

  // Auto-select first item on desktop if nothing is selected
  useEffect(() => {
    if (isMobile === false) {
      if (!selectedCustomer && mockCustomers.length > 0) {
        setSelectedCustomer(mockCustomers[0])
      }
      if (!selectedListing && mockListingsWithCustomers.length > 0) {
        setSelectedListing(mockListingsWithCustomers[0])
      }
    }
  }, [isMobile, selectedCustomer, selectedListing])

  return {
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
  }
}
