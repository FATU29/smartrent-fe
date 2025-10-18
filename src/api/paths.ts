export const PATHS = {
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

  // Property endpoints
  PROPERTY: {
    LIST: '/v1/properties',
    DETAIL: '/v1/properties/:id',
    CREATE: '/v1/properties',
    UPDATE: '/v1/properties/:id',
    DELETE: '/v1/properties/:id',
  },

  // Admin endpoints
  ADMIN: {
    USERS: '/v1/admin/users',
    PROPERTIES: '/v1/admin/properties',
    DASHBOARD: '/v1/admin/dashboard',
  },

  // Membership endpoints
  MEMBERSHIP: {
    PURCHASE: '/v1/memberships/purchase',
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

  // Address endpoints
  ADDRESS: {
    CREATE: '/v1/addresses',
    BY_ID: '/v1/addresses/:addressId',
    SEARCH: '/v1/addresses/search',
    SUGGEST: '/v1/addresses/suggest',
    NEARBY: '/v1/addresses/nearby',
    PROVINCES: '/v1/addresses/provinces',
    PROVINCE_BY_ID: '/v1/addresses/provinces/:provinceId',
    PROVINCE_SEARCH: '/v1/addresses/provinces/search',
    DISTRICTS_BY_PROVINCE: '/v1/addresses/provinces/:provinceId/districts',
    DISTRICT_BY_ID: '/v1/addresses/districts/:districtId',
    WARDS_BY_DISTRICT: '/v1/addresses/districts/:districtId/wards',
    WARD_BY_ID: '/v1/addresses/wards/:wardId',
    STREETS_BY_WARD: '/v1/addresses/wards/:wardId/streets',
    STREET_BY_ID: '/v1/addresses/streets/:streetId',
  },
}
