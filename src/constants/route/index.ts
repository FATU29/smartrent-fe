// Centralized route constants (UPPER_CASE) for Seller area
export const SELLER_ROUTES = {
  OVERVIEW: '/seller/dashboard',
  LISTINGS: '/seller/listings',
  CREATE: '/seller/create-post',
  CUSTOMERS: '/seller/customers',
  MEMBERSHIP: '/seller/membership',
  ACCOUNT: '/seller/account',
} as const

export type SellerRouteKey = keyof typeof SELLER_ROUTES

// Centralized route constants for Sellernet area
export const SELLERNET_ROUTES = {
  PREFIX: '/sellernet',
  OVERVIEW: '/sellernet/overview',
  // Post management
  POST_PREFIX: '/sellernet/post',
  POST_CREATE: '/sellernet/post/create',
  POST_LIST: '/sellernet/post/list',
  POST_DRAFTS: '/sellernet/post/drafts',
  POST_SPONSORED: '/sellernet/post/sponsored',
  // Customers
  CUSTOMERS: '/sellernet/customers',
  // Membership
  MEMBERSHIP_REGISTER: '/sellernet/membership/register',
  // Pro account
  PRO_REGISTER: '/sellernet/pro/register',
  // Finance
  FINANCE_BALANCE: '/sellernet/finance/balance',
  FINANCE_TRANSACTIONS: '/sellernet/finance/transactions',
  FINANCE_PROMOS: '/sellernet/finance/promos',
  FINANCE_TOPUP: '/sellernet/finance/topup',
  // Personal account
  PERSONAL_PREFIX: '/sellernet/personal',
  PERSONAL_EDIT: '/sellernet/personal/edit',
  PERSONAL_SETTINGS: '/sellernet/personal/settings',
  PERSONAL_PRO_BROKER: '/sellernet/personal/pro-broker',
  // Business account
  BUSINESS_PREFIX: '/sellernet/business',
  BUSINESS_REGISTER: '/sellernet/business/register',
  // Pricing & guides
  PRICING: '/sellernet/pricing',
  PAYMENT_GUIDE: '/sellernet/payment-guide',
  USAGE_GUIDE: '/sellernet/usage-guide',
  // Utilities
  UTIL_NOTIFICATIONS: '/sellernet/utilities/notifications',
  UTIL_EMAIL_SUBSCRIPTIONS: '/sellernet/utilities/email-subscriptions',
  UTIL_LOCK_REQUEST: '/sellernet/utilities/lock-request',
} as const

export type SellernetRouteKey = keyof typeof SELLERNET_ROUTES

// Public site routes (homepage, property browsing, etc.)
export const PUBLIC_ROUTES = {
  HOME: '/',
  RESIDENTIAL_LIST: '/properties/residential',
  PROPERTIES_PREFIX: '/properties',
  APARTMENT_DETAIL_PREFIX: '/apartment-detail', // dynamic [...slug]
} as const

export type PublicRouteKey = keyof typeof PUBLIC_ROUTES

// Helper builders for dynamic routes
export const buildApartmentDetailRoute = (slugParts: string | string[]) => {
  const parts = Array.isArray(slugParts) ? slugParts : [slugParts]
  return `${PUBLIC_ROUTES.APARTMENT_DETAIL_PREFIX}/${parts
    .map(encodeURIComponent)
    .join('/')}`
}
