export const PATHS = {
  // Category endpoints
  CATEGORY: {
    ACTIVE: '/v1/categories/active',
  },
  // AI endpoints
  AI: {
    LISTING_DESCRIPTION: '/v1/ai/listing-description',
    HOUSING_PREDICTOR: '/v1/housing-predictor/predict',
  },

  // Auth endpoints
  AUTH: {
    LOGIN: '/v1/auth',
    LOGOUT: '/v1/auth/logout',
    REFRESH: '/v1/auth/refresh',
    ADMIN_LOGIN: '/v1/auth/admin',
    VERIFICATION: '/v1/verification',
    RE_SEND_VERIFICATION: '/v1/verification/code',
    INTROSPECT: '/v1/auth/introspect',
    FORGOT_PASSWORD: '/v1/auth/forgot-password',
    CHANGE_PASSWORD: '/v1/auth/change-password',
    RESET_PASSWORD: '/v1/auth/reset-password',
    GOOGLE_OAUTH: '/v1/auth/outbound/google',
  },

  // User endpoints
  USER: {
    CREATE: '/v1/users',
    PROFILE: '/v1/users/profile',
    UPDATE: '/v1/users/update',
    CHANGE_PASSWORD: '/v1/users/change-password',
  },

  // Property endpoints (deprecated - use LISTING instead)
  PROPERTY: {
    LIST: '/v1/properties',
    DETAIL: '/v1/properties/:id',
    CREATE: '/v1/properties',
    UPDATE: '/v1/properties/:id',
    DELETE: '/v1/properties/:id',
  },

  // Listing endpoints
  LISTING: {
    LIST: '/v1/listings',
    SEARCH: '/v1/listings/search',
    MY_LISTINGS: '/v1/listings/my-listings',
    MY_DRAFTS: '/v1/listings/my-drafts',
    BY_ID: '/v1/listings/:id',
    CREATE: '/v1/listings',
    CREATE_VIP: '/v1/listings/vip',
    // Draft endpoints
    CREATE_DRAFT: '/v1/listings/draft',
    GET_DRAFT: '/v1/listings/draft/:draftId',
    UPDATE_DRAFT: '/v1/listings/draft/:draftId',
    DELETE_DRAFT: '/v1/listings/draft/:draftId',
    PUBLISH_DRAFT: '/v1/listings/draft/:draftId/publish',
    UPDATE: '/v1/listings/:id',
    DELETE: '/v1/listings/:id',
    ADMIN_DETAIL: '/v1/listings/:id/admin',
    QUOTA_CHECK: '/v1/listings/quota-check',
    UPDATE_PRICE: '/v1/listings/:listingId/price',
    PRICING_HISTORY: '/v1/listings/:listingId/pricing-history',
    PRICING_HISTORY_DATE_RANGE:
      '/v1/listings/:listingId/pricing-history/date-range',
    PRICE_STATISTICS: '/v1/listings/:listingId/price-statistics',
    CURRENT_PRICE: '/v1/listings/:listingId/current-price',
    RECENT_PRICE_CHANGES: '/v1/listings/recent-price-changes',
    PROVINCE_STATS: '/v1/listings/stats/provinces',
  },

  // Admin endpoints
  ADMIN: {
    USERS: '/v1/admin/users',
    PROPERTIES: '/v1/admin/properties',
    DASHBOARD: '/v1/admin/dashboard',
  },

  // Membership endpoints
  MEMBERSHIP: {
    INITIATE_PURCHASE: '/v1/memberships/initiate-purchase',
    PACKAGES: '/v1/memberships/packages',
    PACKAGE_BY_ID: '/v1/memberships/packages/:membershipId',
    MY_MEMBERSHIP: '/v1/memberships/my-membership',
    HISTORY: '/v1/memberships/history',
    CANCEL: '/v1/memberships/:userMembershipId',
  },

  // Push Details endpoints
  PUSH: {
    ACTIVE_DETAILS: '/v1/push-details',
    DETAIL_BY_CODE: '/v1/push-details/:detailCode',
    ALL_DETAILS: '/v1/push-details/all',
  },

  // VIP Tier endpoints
  VIP_TIER: {
    ACTIVE: '/v1/vip-tiers',
    BY_CODE: '/v1/vip-tiers/:tierCode',
    ALL: '/v1/vip-tiers/all',
  },

  // Payment endpoints
  PAYMENT: {
    CREATE: '/v1/payments/create',
    REFUND: '/v1/payments/refund/:transactionRef',
    CANCEL: '/v1/payments/cancel/:transactionRef',
    TRANSACTION: '/v1/payments/transactions/:txnRef',
    PROVIDERS: '/v1/payments/providers',
    HISTORY: '/v1/payments/history',
    HISTORY_BY_STATUS: '/v1/payments/history/status/:status',
    EXISTS: '/v1/payments/exists/:transactionRef',
    IPN: '/v1/payments/ipn/:provider',
    CALLBACK: '/v1/payments/callback/:provider',
  },

  // Media endpoints
  MEDIA: {
    UPLOAD_URL: '/v1/media/upload-url',
    CONFIRM_UPLOAD: '/v1/media/:mediaId/confirm',
    UPLOAD: '/v1/media/upload',
    EXTERNAL: '/v1/media/external',
    BY_ID: '/v1/media/:mediaId',
    DELETE: '/v1/media/:mediaId',
    DOWNLOAD_URL: '/v1/media/:mediaId/download-url',
    MY_MEDIA: '/v1/media/my-media',
    BY_LISTING: '/v1/media/listing/:listingId',
  },

  // Address endpoints
  ADDRESS: {
    CREATE: '/v1/addresses',
    BY_ID: '/v1/addresses/:addressId',
    SEARCH: '/v1/addresses/search',
    SEARCH_NEW: '/v1/addresses/search-new-address',
    SUGGEST: '/v1/addresses/suggest',
    NEARBY: '/v1/addresses/nearby',
    HEALTH: '/v1/addresses/health',
    GEOCODE: '/v1/addresses/geocode',
    // Legacy structure (63 provinces)
    PROVINCES: '/v1/addresses/provinces',
    PROVINCE_BY_ID: '/v1/addresses/provinces/:provinceId',
    PROVINCE_SEARCH: '/v1/addresses/provinces/search',
    DISTRICTS_BY_PROVINCE: '/v1/addresses/provinces/:provinceId/districts',
    STREETS_BY_PROVINCE: '/v1/addresses/provinces/:provinceId/streets',
    PROJECTS_BY_PROVINCE: '/v1/addresses/provinces/:provinceId/projects',
    DISTRICT_BY_ID: '/v1/addresses/districts/:districtId',
    DISTRICT_SEARCH: '/v1/addresses/districts/search',
    WARDS_BY_DISTRICT: '/v1/addresses/districts/:districtId/wards',
    STREETS_BY_DISTRICT: '/v1/addresses/districts/:districtId/streets',
    PROJECTS_BY_DISTRICT: '/v1/addresses/districts/:districtId/projects',
    WARD_BY_ID: '/v1/addresses/wards/:wardId',
    WARD_SEARCH: '/v1/addresses/wards/search',
    STREETS_BY_WARD: '/v1/addresses/wards/:wardId/streets',
    STREET_BY_ID: '/v1/addresses/streets/:streetId',
    STREET_SEARCH: '/v1/addresses/streets/search',
    // New structure (34 provinces)
    NEW_PROVINCES: '/v1/addresses/new-provinces',
    NEW_PROVINCE_WARDS: '/v1/addresses/new-provinces/:provinceCode/wards',
    NEW_FULL_ADDRESS: '/v1/addresses/new-full-address',
    // Projects
    PROJECT_BY_ID: '/v1/addresses/projects/:projectId',
    PROJECT_SEARCH: '/v1/addresses/projects/search',
    // Conversion
    CONVERT_NEW_TO_LEGACY: '/v1/addresses/convert/new-to-legacy',
    CONVERT_LEGACY_TO_NEW: '/v1/addresses/convert/legacy-to-new',
    // Merge history
    MERGE_HISTORY: '/v1/addresses/merge-history',
  },

  // Phone Click Detail endpoints
  PHONE_CLICK_DETAIL: {
    TRACK: '/v1/phone-click-details',
    BY_LISTING: '/v1/phone-click-details/listing/:listingId',
    MY_CLICKS: '/v1/phone-click-details/my-clicks',
    LISTING_STATS: '/v1/phone-click-details/listing/:listingId/stats',
    MY_LISTINGS: '/v1/phone-click-details/my-listings',
    SEARCH_MY_LISTINGS: '/v1/phone-click-details/my-listings/search',
  },

  // Exchange Rate endpoints
  EXCHANGE_RATE: {
    LATEST: '/v1/exchange-rates/latest',
    VND_TO_USD: '/v1/exchange-rates/vnd-to-usd',
  },
}
