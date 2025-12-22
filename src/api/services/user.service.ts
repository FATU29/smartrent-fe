import { apiRequest } from '@/configs/axios/instance'
import { ApiResponse } from '@/configs/axios/types'
import { UserApi } from '@/api/types/user.type'
import { ENV } from '@/constants/env'

/**
 * Request body for updating user profile
 * Uses query params + multipart/form-data for avatar
 */
export interface UpdateUserProfileRequest {
  firstName?: string
  lastName?: string
  idDocument?: string
  taxNumber?: string
  contactPhoneNumber?: string
  avatar?: File
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
      url: ENV.API.USER.PROFILE,
    })
  }

  /**
   * Update user profile with PATCH method
   * Supports multipart/form-data for avatar upload
   * Avatar file: max 10MB, allowed formats: jpeg, png, webp
   *
   * @param data - Profile data to update (as query params)
   * @param avatarFile - Avatar file to upload (optional, max 10MB)
   * @returns Updated user profile with avatarUrl
   */
  static async updateProfile(
    data: UpdateUserProfileRequest,
  ): Promise<ApiResponse<UserApi>> {
    const formData = new FormData()

    // Add avatar file if provided
    if (data.avatar) {
      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB in bytes
      if (data.avatar.size > maxSize) {
        throw new Error('Avatar file size must not exceed 10MB')
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(data.avatar.type)) {
        throw new Error('Avatar must be jpeg, png, or webp format')
      }

      formData.append('avatar', data.avatar)
    }

    // Build query params for other fields
    const queryParams = new URLSearchParams()
    if (data.firstName) queryParams.append('firstName', data.firstName)
    if (data.lastName) queryParams.append('lastName', data.lastName)
    if (data.idDocument) queryParams.append('idDocument', data.idDocument)
    if (data.taxNumber) queryParams.append('taxNumber', data.taxNumber)
    if (data.contactPhoneNumber) {
      queryParams.append('contactPhoneNumber', data.contactPhoneNumber)
    }

    const url = `${ENV.API.USER.PROFILE}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    return apiRequest<UserApi>({
      method: 'PATCH',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }
}

// Export individual methods for convenience
export const { getProfile, updateProfile } = UserService
