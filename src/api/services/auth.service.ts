import { apiRequest } from '@/configs/axios/axiosClient'
import { ENV } from '@/constants/env'
import {
  LoginRequest,
  AdminLoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  AuthResponse,
  LogoutResponse,
  UserResponse,
  AuthTokens,
  API_ERROR_CODES,
} from '@/api/types/auth.type'

export class AuthService {
  static async login(
    credentials: LoginRequest,
  ): Promise<AuthTokens | undefined> {
    const response = await apiRequest<AuthResponse>({
      method: 'POST',
      url: ENV.API.AUTH.LOGIN,
      data: credentials,
      skipAuth: true,
    })

    if (response?.code !== API_ERROR_CODES.SUCCESS) {
      console.log('Login failed')
      return
    }

    return response?.data
  }

  static async adminLogin(
    credentials: AdminLoginRequest,
  ): Promise<AuthTokens | undefined> {
    const response = await apiRequest<AuthResponse>({
      method: 'POST',
      url: ENV.API.AUTH.ADMIN_LOGIN,
      data: credentials,
      skipAuth: true,
    })

    if (response?.code !== API_ERROR_CODES.SUCCESS) {
      console.log('Admin login failed')
      return
    }

    return response?.data
  }

  static async logout(token: string): Promise<void> {
    const response = await apiRequest<LogoutResponse>({
      method: 'POST',
      url: ENV.API.AUTH.LOGOUT,
      data: { token },
    })

    if (response?.code !== API_ERROR_CODES.SUCCESS) {
      console.log('Logout failed')
    }
  }

  static async refreshToken(
    refreshToken: string,
  ): Promise<AuthTokens | undefined> {
    const response = await apiRequest<AuthResponse>({
      method: 'POST',
      url: ENV.API.AUTH.REFRESH,
      data: { refreshToken },
      skipAuth: true,
    })

    if (response?.code !== API_ERROR_CODES.SUCCESS) {
      console.log('Token refresh failed')
      return
    }

    return response?.data
  }

  static async register(userData: RegisterRequest): Promise<
    | {
      userId: string
      phoneCode: string
      phoneNumber: string
      email: string
      password: string
      firstName: string
      lastName: string
      idDocument: string
      taxNumber: string
    }
    | undefined
  > {
    const response = await apiRequest<UserResponse>({
      method: 'POST',
      url: ENV.API.USER.CREATE,
      data: userData,
      skipAuth: true,
    })

    if (response?.code !== API_ERROR_CODES.SUCCESS) {
      console.log('Registration failed')
      return
    }

    return response?.data
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

export const { login, adminLogin, logout, refreshToken, register } = AuthService
export const {
  login,
  adminLogin,
  logout,
  refreshToken,
  register,
  changePassword,
} = AuthService
