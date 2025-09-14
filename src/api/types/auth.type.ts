export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
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
  phoneCode: string
  phoneNumber: string
  email: string
  password: string
  firstName: string
  lastName: string
  idDocument: string
  taxNumber: string
}

// Auth API Response Types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  code: string
  data: AuthTokens
}

export interface LogoutResponse {
  code: string
}

export interface UserResponse {
  code: string
  data: {
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
}

// Error Response Types
export interface ApiErrorResponse {
  code: string
  message: string
}

// Validation Patterns - Updated according to API spec
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
} as const

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]
