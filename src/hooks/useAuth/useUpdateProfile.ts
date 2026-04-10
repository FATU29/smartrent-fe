import { useState } from 'react'
import { UserService } from '@/api/services/user.service'
import { MediaService } from '@/api/services/media.service'
import { useAuth } from './index'

interface UpdateProfileResult {
  success: boolean
  message?: string
  error?: string
}

/**
 * Input shape for updating profile from UI components.
 *
 * `avatar` is an optional File picked from a file input. The hook handles
 * uploading it to R2 first, then sends the resulting mediaId to the
 * profile endpoint. Components don't need to know about the two-step flow.
 */
export interface UpdateProfileInput {
  firstName?: string
  lastName?: string
  idDocument?: string
  taxNumber?: string
  contactPhoneNumber?: string
  avatar?: File
}

/** Discrete phases of the avatar update flow, exposed so the UI can show
 *  appropriate feedback (progress bar for upload, spinner for save). */
export type UpdateProfilePhase = 'idle' | 'uploading-avatar' | 'saving-profile'

const MAX_AVATAR_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Hook for updating user profile.
 *
 * Two-step flow when an avatar file is provided:
 *   1. Upload the file to Cloudflare R2 via presigned URL (bypasses Vercel
 *      4.5MB body limit). UI shows upload progress.
 *   2. PATCH /v1/users/profile with `avatarMediaId` (JSON only). UI shows
 *      a save spinner. BE soft-deletes the old avatar media automatically.
 */
export const useUpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<UpdateProfilePhase>('idle')
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0)
  const { updateUser } = useAuth()

  const updateProfile = async (
    data: UpdateProfileInput,
  ): Promise<UpdateProfileResult> => {
    setIsLoading(true)
    setError(null)
    setAvatarUploadProgress(0)

    try {
      let avatarMediaId: number | undefined

      // Step 1: upload avatar to R2 if a new file was selected
      if (data.avatar) {
        if (data.avatar.size > MAX_AVATAR_BYTES) {
          const errorMsg = 'Avatar file size must not exceed 10MB'
          setError(errorMsg)
          return { success: false, error: errorMsg }
        }
        if (!ALLOWED_AVATAR_TYPES.includes(data.avatar.type)) {
          const errorMsg = 'Avatar must be jpeg, png, or webp format'
          setError(errorMsg)
          return { success: false, error: errorMsg }
        }

        setPhase('uploading-avatar')
        const uploadResponse = await MediaService.uploadViaPresign(
          {
            file: data.avatar,
            mediaType: 'IMAGE',
            purpose: 'AVATAR',
          },
          {
            onUploadProgress: (e) => {
              if (!e.total) return
              setAvatarUploadProgress(Math.round((e.loaded / e.total) * 100))
            },
          },
        )

        if (!uploadResponse.success || !uploadResponse.data) {
          const errorMsg = uploadResponse.message || 'Failed to upload avatar'
          setError(errorMsg)
          return { success: false, error: errorMsg }
        }

        avatarMediaId = Number(uploadResponse.data.mediaId)
      }

      // Step 2: save the profile JSON (with the new avatarMediaId if any).
      // Omitting avatarMediaId means "leave avatar unchanged" — BE does not
      // distinguish null vs missing here.
      setPhase('saving-profile')
      const response = await UserService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        idDocument: data.idDocument,
        taxNumber: data.taxNumber,
        contactPhoneNumber: data.contactPhoneNumber,
        avatarMediaId,
      })

      if (response.data) {
        updateUser(response.data)
        return { success: true, message: 'Profile updated successfully' }
      }

      return { success: false, error: 'Failed to update profile' }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
      setPhase('idle')
    }
  }

  return {
    updateProfile,
    isLoading,
    error,
    phase,
    avatarUploadProgress,
  }
}
