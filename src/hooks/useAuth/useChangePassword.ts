import { useMutation } from '@tanstack/react-query'
import { AuthService } from '@/api/services/auth.service'
import type { ChangePasswordRequest } from '@/api/types/auth.type'

// NOTE: auth.type.ts contains two ChangePasswordRequest interface declarations.
// One uses { currentPassword; newPassword } while the second (later) overrides with
// { oldPassword; newPassword; verificationCode }. Because of this duplication,
// we define a local request type aligned with the service expectation.
// Dedicated type matching the effective API shape (second declaration in auth.type.ts)
type EffectiveChangePasswordRequest = {
  oldPassword: string
  newPassword: string
  verificationCode: string
}

interface ChangePasswordVariables {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Map form variables to API request shape
function mapToRequest(
  v: ChangePasswordVariables,
): EffectiveChangePasswordRequest {
  // The API type currently expects oldPassword + newPassword + verificationCode.
  // We don't have a verificationCode flow here yet, so send empty string.
  return {
    oldPassword: v.currentPassword,
    newPassword: v.newPassword,
    verificationCode: '',
  }
}

export const useChangePassword = () => {
  return useMutation({
    mutationKey: ['change-password'],
    mutationFn: async (variables: ChangePasswordVariables) => {
      const req: ChangePasswordRequest = mapToRequest(
        variables,
      ) as ChangePasswordRequest
      const success = await AuthService.changePassword(req)
      if (!success) {
        throw new Error('CHANGE_PASSWORD_FAILED')
      }
      return success
    },
  })
}
