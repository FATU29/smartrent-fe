import { useCreatePost } from '@/contexts/createPost'
import { useUpdatePostForm } from './useUpdatePostForm'
import { usePostSteps } from '@/components/templates/shared/steps.hooks'

const TOTAL_STEPS = 5

export const useUpdatePostSteps = () => {
  const { propertyInfo, media, videoUploadProgress, imagesUploadProgress } =
    useCreatePost()
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
