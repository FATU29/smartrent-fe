/**
 * Transform Phone Click Detail API data to Customer Management UI types
 * @module utils/phoneClickDetailTransform
 */

import type { PhoneClickDetail } from '@/api/types/phone-click-detail.type'
import type {
  Customer,
  ListingWithCustomers,
  CustomerInteraction,
  ListingCustomerInteraction,
} from '@/api/types/customer.type'

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

/**
 * Transform PhoneClickDetail array to Customer array
 * Groups clicks by user and creates customer objects
 */
export const transformToCustomers = (
  phoneClicks: PhoneClickDetail[],
): Customer[] => {
  // Group clicks by userId
  const userMap = new Map<string, PhoneClickDetail[]>()

  phoneClicks.forEach((click) => {
    const existing = userMap.get(click.userId) || []
    existing.push(click)
    userMap.set(click.userId, existing)
  })

  // Transform to Customer array
  const customers: Customer[] = []

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

    // Transform to interactions
    const interactions: CustomerInteraction[] = sortedClicks.map((click) => ({
      id: click.id.toString(),
      type: 'phone' as const,
      timestamp: formatDate(click.clickedAt),
      listingId: click.listingId.toString(),
      listingTitle: `Listing #${click.listingId}`, // You may want to fetch listing details
      listingAddress: '', // You may want to fetch listing details
    }))

    customers.push({
      id: userId,
      name: fullName,
      phone: firstClick.userContactPhone || 'N/A',
      email: firstClick.userEmail || undefined,
      initials,
      interactions,
      totalInteractions: clicks.length,
      latestInteraction: formatRelativeTime(sortedClicks[0].clickedAt),
    })
  })

  // Sort by latest interaction (newest first)
  return customers.sort(
    (a, b) =>
      new Date(
        phoneClicks.find((c) => c.userId === b.id)?.clickedAt || 0,
      ).getTime() -
      new Date(
        phoneClicks.find((c) => c.userId === a.id)?.clickedAt || 0,
      ).getTime(),
  )
}

/**
 * Transform PhoneClickDetail array to ListingWithCustomers array
 * Groups clicks by listingId and creates listing objects
 */
export const transformToListingsWithCustomers = (
  phoneClicks: PhoneClickDetail[],
): ListingWithCustomers[] => {
  // Group clicks by listingId
  const listingMap = new Map<number, PhoneClickDetail[]>()

  phoneClicks.forEach((click) => {
    const existing = listingMap.get(click.listingId) || []
    existing.push(click)
    listingMap.set(click.listingId, existing)
  })

  // Transform to ListingWithCustomers array
  const listings: ListingWithCustomers[] = []

  listingMap.forEach((clicks, listingId) => {
    // Sort clicks by timestamp (newest first)
    const sortedClicks = [...clicks].sort(
      (a, b) =>
        new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime(),
    )

    // Transform to interactions
    const interactions: ListingCustomerInteraction[] = sortedClicks.map(
      (click) => {
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
      },
    )

    listings.push({
      id: listingId.toString(),
      title: `Listing #${listingId}`, // You may want to fetch listing details
      address: '', // You may want to fetch listing details
      city: '', // You may want to fetch listing details
      price: 0, // You may want to fetch listing details
      currency: 'đ',
      propertyType: '', // You may want to fetch listing details
      interactions,
      totalInteractions: clicks.length,
      lastActivity: formatRelativeTime(sortedClicks[0].clickedAt),
    })
  })

  // Sort by last activity (newest first)
  return listings.sort(
    (a, b) =>
      new Date(
        phoneClicks.find((c) => c.listingId === Number(b.id))?.clickedAt || 0,
      ).getTime() -
      new Date(
        phoneClicks.find((c) => c.listingId === Number(a.id))?.clickedAt || 0,
      ).getTime(),
  )
}
