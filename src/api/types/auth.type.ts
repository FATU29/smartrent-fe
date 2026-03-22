// Auth API Request Types
export interface LoginRequest {
  email: string
  password: string
}

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface LogoutRequest {
  token: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface ResetPasswordRequest {
  resetPasswordToken: string
  newPassword: string
}

export interface ResetPasswordResponse {
  resetPasswordToken: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  verificationCode: string
}

// Error Response Types
export interface ApiErrorResponse {
  code: string
  message: string
}

export const VALIDATION_PATTERNS = {
  EMAIL:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&*(){}\[\]!~`|])(?=.*\d).*$/,
  PHONE_CODE: /^.{1,5}$/,
  PHONE_NUMBER: /^.{5,20}$/,
}

// API Error Codes
export const API_ERROR_CODES = {
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
  USER_NOT_VERIFIED: '5004',
} as const

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]
