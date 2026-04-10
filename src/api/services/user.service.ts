import { apiRequest } from '@/configs/axios/instance'
import { ApiResponse } from '@/configs/axios/types'
import { UserApi } from '@/api/types/user.type'
import { ENV } from '@/constants/env'

/**
 * JSON request body for PATCH /v1/users/profile.
 *
 * The avatar binary is no longer sent here — clients first upload it
 * directly to R2 via the presigned-URL flow and then pass the resulting
 * `avatarMediaId` to associate it with the user.
 */
export interface UpdateUserProfileRequest {
  firstName?: string
  lastName?: string
  idDocument?: string
  taxNumber?: string
  contactPhoneNumber?: string
  avatarMediaId?: number
}

/**
 * User Service
 * Handles user profile operations
 */
export class UserService {
  /**
   * Get current user profile
   * @returns User profile data
   */
  static async getProfile(): Promise<ApiResponse<UserApi>> {
    return apiRequest<UserApi>({
      method: 'GET',
      // Backend maps GET /v1/users to profile
      url: ENV.API.USER.CREATE,
    })
  }

  /**
   * Update user profile via JSON PATCH /v1/users/profile.
   *
   * The legacy multipart endpoint accepted an avatar file directly, but
   * Vercel's 4.5MB body limit blocks anything larger. Avatars now go to R2
   * via presigned URL first; only the resulting mediaId is sent here.
   *
   * @param data - Profile fields to update (and optional avatarMediaId)
   * @returns Updated user profile with resolved avatarUrl
   */
  static async updateProfile(
    data: UpdateUserProfileRequest,
  ): Promise<ApiResponse<UserApi>> {
    return apiRequest<UserApi>({
      method: 'PATCH',
      url: ENV.API.USER.PROFILE,
      data,
    })
  }
}

// Export individual methods for convenience
export const { getProfile, updateProfile } = UserService
