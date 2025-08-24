export const ENV = {
  GOOGLE_MAP_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY || '',
  IS_PRODUCTION: process.env.NEXT_PUBLIC_DEPLOY_ENV || '',
  URL_API_AI: process.env.NEXT_PUBLIC_URL_API_AI || 'http://localhost:8000/',
  URL_API_BASE:
    process.env.NEXT_PUBLIC_URL_API_BASE || 'http://localhost:8080/',
}
