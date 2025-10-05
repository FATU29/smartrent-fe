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
    GOOGLE_OAUTH: '/api/auth/google/callback',
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
}
