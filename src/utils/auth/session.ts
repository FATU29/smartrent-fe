import { QueryClient } from '@tanstack/react-query'
import { AuthTokens } from '@/configs/axios/types'
import { UserApi } from '@/api/types/user.type'
import { UserService } from '@/api/services/user.service'
import { clearLegacyAuthStorage } from '@/utils/authLocalStorage'
import { cookieManager } from '@/utils/cookies'
import { decodeToken } from '@/utils/decode-jwt'

const AUTH_PROFILE_QUERY_PREFIXES = [
  ['sellernet', 'personal-edit-profile'],
  ['create-post-profile-phone-check'],
  ['create-post-order-summary-profile'],
] as const

export const clearAuthProfileQueries = (queryClient: QueryClient) => {
  AUTH_PROFILE_QUERY_PREFIXES.forEach((queryKey) => {
    queryClient.removeQueries({ queryKey, exact: false })
  })
}

export const resolveAuthenticatedUser = async (
  tokens: AuthTokens,
  queryClient: QueryClient,
): Promise<UserApi> => {
  clearLegacyAuthStorage()
  cookieManager.setAuthTokens(tokens)
  clearAuthProfileQueries(queryClient)

  const fallbackUser = decodeToken(tokens.accessToken).user

  try {
    const profileResponse = await UserService.getProfile()
    if (profileResponse.success && profileResponse.data) {
      return profileResponse.data
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[auth/session] Failed to refresh current user profile:',
        error,
      )
    }
  }

  return fallbackUser
}
