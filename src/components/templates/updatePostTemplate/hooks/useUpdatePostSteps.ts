import { useUpdatePost } from '@/contexts/updatePost'
import { useUpdatePostForm } from './useUpdatePostForm'
import { usePostSteps } from '@/components/templates/shared/steps.hooks'

const TOTAL_STEPS = 4

export const useUpdatePostSteps = () => {
  const { propertyInfo, media, videoUploadProgress, imagesUploadProgress } =
    useUpdatePost()
  const form = useUpdatePostForm()

  return usePostSteps({
    totalSteps: TOTAL_STEPS,
    form,
    propertyInfo,
    media,
    videoUploadProgress,
    imagesUploadProgress,
    isCreatePost: false,
  })
}
