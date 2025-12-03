import { useState, useEffect, useMemo } from 'react'
import type { PhoneClickDetail } from '@/api/types/phone-click-detail.type'
import type { Customer, ListingWithCustomers } from '@/api/types/customer.type'
import { useMyPhoneClicks } from '@/hooks/usePhoneClickDetails'

interface UseCustomerManagementOptions {
  isMobile: boolean
  searchTitle: string // Debounced search from parent
}

/**
 * Get initials from full name
 */
const getInitialsFromName = (name: string): string => {
  const words = name.trim().split(' ')
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

/**
 * Format relative time from ISO date string
 */
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes}m ago`
    }
    return `${diffHours}h ago`
  }

  if (diffDays === 1) return '1d ago'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks}w ago`
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months}mo ago`
  }
  const years = Math.floor(diffDays / 365)
  return `${years}y ago`
}

/**
 * Format date to readable format
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  const displayMinutes = minutes.toString().padStart(2, '0')
  return `${month} ${day}, ${displayHours}:${displayMinutes} ${ampm}`
}

export const useCustomerManagement = ({
  isMobile,
  searchTitle,
}: UseCustomerManagementOptions) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'listings'>(
    'customers',
  )
  const [page, setPage] = useState(1)
  const [allPhoneClicks, setAllPhoneClicks] = useState<PhoneClickDetail[]>([])

  // Fetch phone clicks - returns raw PhoneClickDetail[]
  const {
    data: phoneClicksData,
    isLoading: isPhoneClicksLoading,
    isFetching: isPhoneClicksFetching,
  } = useMyPhoneClicks({
    enabled: true,
    searchTitle,
    page,
    size: 20, // Changed from 100 to 20
  })

  // Append new data to existing data for infinite scroll
  useEffect(() => {
    if (phoneClicksData && phoneClicksData.length > 0) {
      if (page === 1) {
        // Reset data when search changes or first load
        setAllPhoneClicks(phoneClicksData)
      } else {
        // Append new page data
        setAllPhoneClicks((prev) => [...prev, ...phoneClicksData])
      }
    } else if (page === 1 && phoneClicksData) {
      // Empty result on first page
      setAllPhoneClicks([])
    }
  }, [phoneClicksData, page])

  // Reset page when search changes
  useEffect(() => {
    setPage(1)
    setAllPhoneClicks([])
  }, [searchTitle])

  const phoneClicks = allPhoneClicks

  // Loading states
  const isDataLoading = isPhoneClicksLoading || isPhoneClicksFetching

  // Load more function for infinite scroll
  const loadMore = () => {
    if (
      !isPhoneClicksFetching &&
      phoneClicksData &&
      phoneClicksData.length === 20
    ) {
      setPage((prev) => prev + 1)
    }
  }

  const hasMore = phoneClicksData ? phoneClicksData.length === 20 : false

  // Group phone clicks by userId to create customers
  const customers = useMemo<Customer[]>(() => {
    const userMap = new Map<string, PhoneClickDetail[]>()

    phoneClicks.forEach((click) => {
      const existing = userMap.get(click.userId) || []
      existing.push(click)
      userMap.set(click.userId, existing)
    })

    const customerList: Customer[] = []

    userMap.forEach((clicks, userId) => {
      const firstClick = clicks[0]
      const fullName =
        `${firstClick.userFirstName} ${firstClick.userLastName}`.trim()
      const initials = getInitialsFromName(fullName)

      // Sort clicks by timestamp (newest first)
      const sortedClicks = [...clicks].sort(
        (a, b) =>
          new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime(),
      )

      customerList.push({
        id: userId,
        name: fullName,
        phone: firstClick.userContactPhone || 'N/A',
        email: firstClick.userEmail || undefined,
        initials,
        interactions: sortedClicks.map((click) => ({
          id: click.id.toString(),
          type: 'phone' as const,
          timestamp: formatDate(click.clickedAt),
          listingId: click.listingId.toString(),
          listingTitle: click.listingTitle || `Listing #${click.listingId}`,
          listingAddress: '',
        })),
        totalInteractions: clicks.length,
        latestInteraction: formatRelativeTime(sortedClicks[0].clickedAt),
      })
    })

    // Sort by latest interaction (newest first)
    return customerList.sort((a, b) => {
      const aLatest = phoneClicks.find((c) => c.userId === a.id)?.clickedAt
      const bLatest = phoneClicks.find((c) => c.userId === b.id)?.clickedAt
      return new Date(bLatest || 0).getTime() - new Date(aLatest || 0).getTime()
    })
  }, [phoneClicks])

  // Group phone clicks by listingId to create listings
  const listings = useMemo<ListingWithCustomers[]>(() => {
    const listingMap = new Map<number, PhoneClickDetail[]>()

    phoneClicks.forEach((click) => {
      const existing = listingMap.get(click.listingId) || []
      existing.push(click)
      listingMap.set(click.listingId, existing)
    })

    const listingList: ListingWithCustomers[] = []

    listingMap.forEach((clicks, listingId) => {
      // Sort clicks by timestamp (newest first)
      const sortedClicks = [...clicks].sort(
        (a, b) =>
          new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime(),
      )

      listingList.push({
        id: listingId.toString(),
        title: sortedClicks[0].listingTitle || `Listing #${listingId}`,
        address: '',
        city: '',
        price: 0,
        currency: 'đ',
        propertyType: '',
        interactions: sortedClicks.map((click) => {
          const fullName = `${click.userFirstName} ${click.userLastName}`.trim()
          const initials = getInitialsFromName(fullName)

          return {
            id: click.id.toString(),
            customerId: click.userId,
            customerName: fullName,
            customerPhone: click.userContactPhone || 'N/A',
            customerEmail: click.userEmail || undefined,
            customerInitials: initials,
            type: 'phone' as const,
            timestamp: formatDate(click.clickedAt),
          }
        }),
        totalInteractions: clicks.length,
        lastActivity: formatRelativeTime(sortedClicks[0].clickedAt),
      })
    })

    // Sort by last activity (newest first)
    return listingList.sort((a, b) => {
      const aLatest = phoneClicks.find(
        (c) => c.listingId === Number(a.id),
      )?.clickedAt
      const bLatest = phoneClicks.find(
        (c) => c.listingId === Number(b.id),
      )?.clickedAt
      return new Date(bLatest || 0).getTime() - new Date(aLatest || 0).getTime()
    })
  }, [phoneClicks])

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  )
  const [selectedListing, setSelectedListing] =
    useState<ListingWithCustomers | null>(null)

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
    selectedCustomer,
    setSelectedCustomer,
    selectedListing,
    setSelectedListing,
    isLoading: isDataLoading,
    filteredCustomers: customers,
    filteredListings: listings,
    totalCustomers: customers.length,
    totalListings: listings.length,
    loadMore,
    hasMore,
    isFetchingMore: isPhoneClicksFetching && page > 1,
  }
}
