import { UserApi } from '@/api/types/user.type'
import { jwtDecode } from 'jwt-decode'

interface CustomJwtPayload {
  sub: string
  scope: string
  iss: string
  // Guest tokens are not refreshable, so rfId is absent on them.
  rfId?: string
  exp: number
  iat: number
  user: UserApi
  jti: string
  // Magic-link guest sessions only — registered tokens omit this claim.
  guest?: boolean
  email?: string
}

export const decodeToken = (token: string): CustomJwtPayload => {
  const decoded = jwtDecode<CustomJwtPayload>(token)
  return decoded
}

export const isGuestToken = (token: string | null | undefined): boolean => {
  if (!token) return false
  try {
    const claims = decodeToken(token)
    return claims.guest === true || (claims.sub?.startsWith('guest:') ?? false)
  } catch {
    return false
  }
}
