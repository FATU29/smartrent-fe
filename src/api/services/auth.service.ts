import { ENV } from '@/constants/env'
import {
  LoginRequest,
  AdminLoginRequest,
  RegisterRequest,
  AuthTokens,
  ResetPasswordResponse,
  ResetPasswordRequest,
  ChangePasswordRequest,
  MagicLinkRequest,
  MagicLinkResponse,
  MagicLinkVerifyRequest,
  MagicLinkVerifyResponse,
  API_ERROR_CODES,
} from '@/api/types/auth.type'
import { UserApi } from '../types/user.type'
import { ApiResponse } from '@/configs/axios/types'
import { VerificationAPI } from '../types/verification.type'
import { apiRequest } from '@/configs/axios/instance'

/**
 * Authentication Service
 * Handles all authentication and authorization operations
 */
export class AuthService {
  /**
   * Login with email and password
   * @param credentials - Login credentials (email, password)
   * @returns Authentication tokens
   */
  static async login(
    credentials: LoginRequest,
  ): Promise<ApiResponse<AuthTokens>> {
    const response = await apiRequest<AuthTokens>({
      method: 'POST',
      url: ENV.API.AUTH.LOGIN,
      data: credentials,
      skipAuth: true,
    })

    return response
  }

  /**
   * Admin login with elevated privileges
   * @param credentials - Admin login credentials
   * @returns Authentication tokens with admin scope
   */
  static async adminLogin(
    credentials: AdminLoginRequest,
  ): Promise<ApiResponse<AuthTokens>> {
    const response = await apiRequest<AuthTokens>({
      method: 'POST',
      url: ENV.API.AUTH.ADMIN_LOGIN,
      data: credentials,
      skipAuth: true,
    })

    return response
  }

  /**
   * Logout user and invalidate token
   * @param token - Current authentication token
   * @returns Success response
   */
  static async logout(token: string): Promise<ApiResponse<null>> {
    const response = await apiRequest<null>({
      method: 'POST',
      url: ENV.API.AUTH.LOGOUT,
      data: { token },
    })

    return response
  }

  /**
   * Refresh authentication token
   * @param refreshToken - Valid refresh token
   * @returns New authentication tokens
   */
  static async refreshToken(
    refreshToken: string,
  ): Promise<ApiResponse<AuthTokens>> {
    const response = await apiRequest<AuthTokens>({
      method: 'POST',
      url: ENV.API.AUTH.REFRESH,
      data: { refreshToken },
      skipAuth: true,
    })

    return response
  }

  /**
   * Register new user account
   * @param userData - User registration data
   * @returns Created user information
   */
  static async register(
    userData: RegisterRequest,
  ): Promise<ApiResponse<UserApi>> {
    const response = await apiRequest<UserApi>({
      method: 'POST',
      url: ENV.API.USER.CREATE,
      data: userData,
      skipAuth: true,
    })

    return response
  }

  /**
   * Verify OTP code for email verification
   * @param request - Verification request with code and email
   * @returns Success response
   */
  static async verifyOtp(request: VerificationAPI): Promise<ApiResponse<null>> {
    const response = await apiRequest<null>({
      method: 'POST',
      url: ENV.API.AUTH.VERIFICATION,
      data: request,
      skipAuth: true,
    })

    return response
  }

  /**
   * Resend OTP code to email
   * @param email - User email address
   * @returns Success response
   */
  static async resendOtp(email: string): Promise<ApiResponse<null>> {
    const response = await apiRequest<null>({
      method: 'POST',
      url: `${ENV.API.AUTH.RE_SEND_VERIFICATION}?email=${encodeURIComponent(email)}`,
      skipAuth: true,
    })

    return response
  }

  /**
   * Validate authentication token
   * @param token - Token to validate
   * @returns Validation result
   */
  static async validToken(
    token: string,
  ): Promise<ApiResponse<{ valid: boolean }>> {
    const response = await apiRequest<{
      valid: boolean
    }>({
      method: 'POST',
      url: ENV.API.AUTH.INTROSPECT,
      data: { token },
      skipAuth: true,
    })

    return response
  }

  /**
   * Verify OTP for password reset
   * @param verificationCode - Verification code and email
   * @returns Reset password token
   */
  static async verifyOtpResetPassword(verificationCode: {
    verificationCode: string
    email: string
  }): Promise<ApiResponse<ResetPasswordResponse>> {
    const response = await apiRequest<ResetPasswordResponse>({
      method: 'POST',
      url: ENV.API.AUTH.FORGOT_PASSWORD,
      data: verificationCode,
      skipAuth: true,
    })

    return response
  }

  /**
   * Reset password with token
   * @param request - Reset password request with new password
   * @returns Success response
   */
  static async resetPassword(
    request: ResetPasswordRequest,
  ): Promise<ApiResponse<null>> {
    const response = await apiRequest<null>({
      method: 'POST',
      url: ENV.API.AUTH.RESET_PASSWORD,
      data: request,
    })

    return response
  }

  /**
   * Change password for authenticated user
   * @param passwordData - Current and new password data
   * @returns Boolean indicating success
   */
  static async changePassword(
    passwordData: ChangePasswordRequest,
  ): Promise<boolean> {
    const response = await apiRequest<{ code: string }>({
      method: 'POST',
      url: ENV.API.USER.CHANGE_PASSWORD,
      data: passwordData,
    })

    return response?.code === API_ERROR_CODES.SUCCESS
  }

  /**
   * Authenticate with Google OAuth
   * @param code - Google OAuth authorization code
   * @returns Authentication tokens and user data
   */
  static async googleOAuth(code: string): Promise<ApiResponse<AuthTokens>> {
    const response = await apiRequest<AuthTokens>({
      method: 'POST',
      url: ENV.API.AUTH.GOOGLE_OAUTH,
      data: { code },
      skipAuth: true,
    })

    return response
  }

  /**
   * Request a guest magic-link login email. Always 200 — response shape is the
   * same regardless of whether the email is registered, so callers cannot
   * enumerate accounts.
   */
  static async requestMagicLink(
    request: MagicLinkRequest,
  ): Promise<ApiResponse<MagicLinkResponse>> {
    const response = await apiRequest<MagicLinkResponse>({
      method: 'POST',
      url: ENV.API.AUTH.MAGIC_LINK_REQUEST,
      data: request,
      skipAuth: true,
    })

    return response
  }

  /**
   * Exchange a single-use magic-link token for a guest access token.
   * No refresh token is issued — when this expires the user must request a new link.
   */
  static async verifyMagicLink(
    request: MagicLinkVerifyRequest,
  ): Promise<ApiResponse<MagicLinkVerifyResponse>> {
    const response = await apiRequest<MagicLinkVerifyResponse>({
      method: 'POST',
      url: ENV.API.AUTH.MAGIC_LINK_VERIFY,
      data: request,
      skipAuth: true,
    })

    return response
  }
}

// Export individual methods for convenience
export const {
  login,
  adminLogin,
  logout,
  refreshToken,
  register,
  verifyOtp,
  resendOtp,
  validToken,
  verifyOtpResetPassword,
  resetPassword,
  changePassword,
  googleOAuth,
  requestMagicLink,
  verifyMagicLink,
} = AuthService
