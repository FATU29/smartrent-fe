import { useState } from 'react'
import {
  UserService,
  UpdateUserProfileRequest,
} from '@/api/services/user.service'
import { useAuth } from './index'

interface UpdateProfileResult {
  success: boolean
  message?: string
  error?: string
}

/**
 * Hook for updating user profile
 * Handles profile update with optional avatar upload (max 5MB)
 * Supports formats: jpeg, png, webp
 */
export const useUpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updateUser } = useAuth()

  /**
   * Update user profile using PATCH /v1/users/profile
   * @param data - Profile data to update (includes avatar file)
   * @returns Result object with success status
   */
  const updateProfile = async (
    data: UpdateUserProfileRequest,
  ): Promise<UpdateProfileResult> => {
    setIsLoading(true)
    setError(null)

    try {
      // Validate avatar file size if provided
      if (data.avatar) {
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (data.avatar.size > maxSize) {
          const errorMsg = 'Avatar file size must not exceed 5MB'
          setError(errorMsg)
          return {
            success: false,
            error: errorMsg,
          }
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(data.avatar.type)) {
          const errorMsg = 'Avatar must be jpeg, png, or webp format'
          setError(errorMsg)
          return {
            success: false,
            error: errorMsg,
          }
        }
      }

      const response = await UserService.updateProfile(data)

      if (response.data) {
        // Update auth context with new user data
        updateUser(response.data)

        return {
          success: true,
          message: 'Profile updated successfully',
        }
      }

      return {
        success: false,
        error: 'Failed to update profile',
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateProfile,
    isLoading,
    error,
  }
}
