import { useUpdatePost } from '@/contexts/updatePost'
import { usePostValidation } from '@/components/templates/shared/validation.hooks'
import type { FieldErrors } from 'react-hook-form'
import type { CreateListingRequest } from '@/api/types/property.type'

export const useUpdatePostValidation = (
  currentStep: number,
  attemptedSubmit: boolean,
  errors: FieldErrors<Partial<CreateListingRequest>>,
) => {
  const { propertyInfo, media } = useUpdatePost()

  return usePostValidation({
    currentStep,
    attemptedSubmit,
    errors,
    propertyInfo,
    media,
    isCreatePost: false,
  })
}
