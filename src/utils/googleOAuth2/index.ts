import { ENV } from '@/constants/env'

const GOOGLE_OAUTH_CONFIG = {
  clientId: ENV.GOOGLE_CLIENT_ID,
  redirectUri: ENV.GOOGLE_REDIRECT_URI,
  scope: 'openid email profile',
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent',
}

const getGoogleOAuthURL = () => {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
    scope: GOOGLE_OAUTH_CONFIG.scope,
    response_type: GOOGLE_OAUTH_CONFIG.responseType,
    access_type: GOOGLE_OAUTH_CONFIG.accessType,
    prompt: GOOGLE_OAUTH_CONFIG.prompt,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export const googleOAuthURL = getGoogleOAuthURL()

export { getGoogleOAuthURL, GOOGLE_OAUTH_CONFIG }
