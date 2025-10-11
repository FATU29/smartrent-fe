import { Customer, ListingWithCustomers } from '@/api/types/customer.type'

// Mock data for customers
export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Nguyen Van An',
    phone: '+84 901 234 567',
    email: 'nguyen.van.an@email.com',
    initials: 'NVA',
    totalInteractions: 2,
    latestInteraction: '627d ago',
    hasUnviewed: false,
    interactions: [
      {
        id: 'int-1',
        type: 'zalo',
        timestamp: 'Jan 22, 09:30 PM',
        listingId: '1',
        listingTitle: 'Modern 2BR Apartment in District 1',
        listingAddress: '123 Nguyen Hue Street, District 1',
        viewed: true,
      },
    ],
  },
  {
    id: '2',
    name: 'Tran Thi Mai',
    phone: '+84 902 345 678',
    email: 'tran.thi.mai@email.com',
    initials: 'TTM',
    totalInteractions: 1,
    latestInteraction: '628d ago',
    hasUnviewed: false,
    interactions: [
      {
        id: 'int-2',
        type: 'phone',
        timestamp: 'Jan 21, 11:45 PM',
        listingId: '1',
        listingTitle: 'Modern 2BR Apartment in District 1',
        listingAddress: '123 Nguyen Hue Street, District 1',
        viewed: true,
      },
    ],
  },
  {
    id: '3',
    name: 'Le Minh Duc',
    phone: '+84 903 456 789',
    initials: 'LMD',
    totalInteractions: 1,
    latestInteraction: '629d ago',
    hasUnviewed: true,
    interactions: [
      {
        id: 'int-3',
        type: 'zalo',
        timestamp: 'Jan 20, 08:15 PM',
        listingId: '3',
        listingTitle: 'Commercial Space in District 3',
        listingAddress: '789 Le Van Sy Street, District 3',
        viewed: false,
      },
    ],
  },
  {
    id: '4',
    name: 'Pham Thi Hoa',
    phone: '+84 904 567 890',
    email: 'pham.thi.hoa@email.com',
    initials: 'PTH',
    totalInteractions: 3,
    latestInteraction: '630d ago',
    hasUnviewed: true,
    interactions: [
      {
        id: 'int-4',
        type: 'phone',
        timestamp: 'Jan 19, 03:20 PM',
        listingId: '2',
        listingTitle: 'Luxury Villa in District 7',
        listingAddress: '456 Nguyen Van Linh, District 7',
        viewed: false,
      },
    ],
  },
]

// Mock data for listings
export const mockListingsWithCustomers: ListingWithCustomers[] = [
  {
    id: '1',
    title: 'Modern 2BR Apartment in District 1',
    address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
    city: 'Ho Chi Minh City',
    price: 25000000,
    currency: 'đ',
    image: '/images/example.png',
    propertyType: 'Apartment',
    totalInteractions: 2,
    lastActivity: '627d ago',
    interactions: [
      {
        id: 'lint-1',
        customerId: '1',
        customerName: 'Nguyen Van An',
        customerPhone: '+84 901 234 567',
        customerEmail: 'nguyen.van.an@email.com',
        customerInitials: 'NVA',
        type: 'zalo',
        timestamp: 'Jan 22, 09:30 PM',
        viewed: true,
      },
      {
        id: 'lint-2',
        customerId: '2',
        customerName: 'Tran Thi Mai',
        customerPhone: '+84 902 345 678',
        customerEmail: 'tran.thi.mai@email.com',
        customerInitials: 'TTM',
        type: 'phone',
        timestamp: 'Jan 21, 11:45 PM',
        viewed: true,
      },
    ],
  },
  {
    id: '2',
    title: 'Luxury Villa in District 7',
    address: '456 Nguyen Van Linh, District 7, Ho Chi Minh City',
    city: 'Ho Chi Minh City',
    price: 45000000,
    currency: 'đ',
    image: '/images/example.png',
    propertyType: 'Villa',
    totalInteractions: 2,
    lastActivity: '628d ago',
    interactions: [
      {
        id: 'lint-3',
        customerId: '2',
        customerName: 'Tran Thi Mai',
        customerPhone: '+84 902 345 678',
        customerEmail: 'tran.thi.mai@email.com',
        customerInitials: 'TTM',
        type: 'phone',
        timestamp: 'Jan 22, 10:00 AM',
        viewed: true,
      },
      {
        id: 'lint-4',
        customerId: '4',
        customerName: 'Pham Thi Hoa',
        customerPhone: '+84 904 567 890',
        customerEmail: 'pham.thi.hoa@email.com',
        customerInitials: 'PTH',
        type: 'phone',
        timestamp: 'Jan 19, 03:20 PM',
        viewed: false,
      },
    ],
  },
  {
    id: '3',
    title: 'Commercial Space in District 3',
    address: '789 Le Van Sy Street, District 3, Ho Chi Minh City',
    city: 'Ho Chi Minh City',
    price: 120000000,
    currency: 'đ',
    image: '/images/example.png',
    propertyType: 'Commercial',
    totalInteractions: 1,
    lastActivity: '629d ago',
    interactions: [
      {
        id: 'lint-5',
        customerId: '3',
        customerName: 'Le Minh Duc',
        customerPhone: '+84 903 456 789',
        customerInitials: 'LMD',
        type: 'zalo',
        timestamp: 'Jan 20, 08:15 PM',
        viewed: false,
      },
    ],
  },
]

export const getInitialsFromName = (name: string): string => {
  const words = name.trim().split(' ')
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}
