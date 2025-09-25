import { PATHS } from '@/api/paths'

export const ENV = {
  GOOGLE_MAP_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY || '',
  IS_PRODUCTION: process.env.NEXT_PUBLIC_DEPLOY_ENV || '',
  URL_API_AI: process.env.NEXT_PUBLIC_URL_API_AI || 'http://localhost:8000/',
  URL_API_BASE:
    process.env.NEXT_PUBLIC_URL_API_BASE || 'http://localhost:8080/',
  // Site metadata
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'SmartRent',

  // API endpoints
  API: PATHS,

  // API response codes
  API_CODES: {
    SUCCESS: '999999',
    INVALID_EMAIL: '2001',
    INVALID_PASSWORD: '2002',
    FIELD_REQUIRED: '2004',
    INVALID_PHONE: '2005',
    EMAIL_EXISTS: '3001',
    PHONE_EXISTS: '3002',
    DOCUMENT_EXISTS: '3003',
    TAX_NUMBER_EXISTS: '3004',
    INVALID_CREDENTIALS: '5002',
    INVALID_TOKEN: '5003',
  },
}
