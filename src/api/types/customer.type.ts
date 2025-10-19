export type InteractionType = 'zalo' | 'phone'

export interface CustomerInteraction {
  id: string
  type: InteractionType
  timestamp: string
  listingId: string
  listingTitle: string
  listingAddress: string
  viewed: boolean
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  initials: string
  interactions: CustomerInteraction[]
  totalInteractions: number
  latestInteraction: string
  hasUnviewed: boolean
}

export interface ListingCustomerInteraction {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerInitials: string
  type: InteractionType
  timestamp: string
  viewed: boolean
}

export interface ListingWithCustomers {
  id: string
  title: string
  address: string
  city: string
  price: number
  currency: string
  image?: string
  propertyType: string
  interactions: ListingCustomerInteraction[]
  totalInteractions: number
  lastActivity: string
}
