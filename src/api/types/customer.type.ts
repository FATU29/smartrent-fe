export type InteractionType = 'zalo' | 'phone'

export interface CustomerInteraction {
  id: string
  type: InteractionType
  timestamp: string
  listingId: string
  listingTitle: string
  listingAddress: string
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
