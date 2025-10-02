import { apiRequest } from '@/configs/axios/axiosClient'
import { ENV } from '@/constants/env'
import {
  LoginRequest,
  AdminLoginRequest,
  RegisterRequest,
  AuthTokens,
  ResetPasswordResponse,
  ResetPasswordRequest,
  ChangePasswordRequest,
  API_ERROR_CODES,
} from '@/api/types/auth.type'
import { UserApi } from '../types/user.type'
import { ApiResponse } from '@/configs/axios/types'
import { VerificationAPI } from '../types/verification.type'

export class AuthService {
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

  static async logout(token: string): Promise<ApiResponse<null>> {
    const response = await apiRequest<null>({
      method: 'POST',
      url: ENV.API.AUTH.LOGOUT,
      data: { token },
    })

    return response
  }

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

  static async verifyOtp(request: VerificationAPI): Promise<ApiResponse<null>> {
    const response = await apiRequest<null>({
      method: 'POST',
      url: ENV.API.AUTH.VERIFICATION,
      data: request,
      skipAuth: true,
    })

    return response
  }

  static async resendOtp(email: string): Promise<ApiResponse<null>> {
    const response = await apiRequest<null>({
      method: 'POST',
      url: `${ENV.API.AUTH.RE_SEND_VERIFICATION}?email=${encodeURIComponent(email)}`,
      skipAuth: true,
    })

    return response
  }

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
}

export const {
  login,
  adminLogin,
  logout,
  refreshToken,
  register,
  verifyOtpResetPassword,
  resetPassword,
  changePassword,
} = AuthService
