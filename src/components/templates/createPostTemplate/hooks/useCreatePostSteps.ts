import { useCreatePost } from '@/contexts/createPost'
import { useCreatePostForm } from './useCreatePostForm'
import { usePostSteps } from '@/components/templates/shared/steps.hooks'

const TOTAL_STEPS = 5

export const useCreatePostSteps = () => {
  const { propertyInfo, media, videoUploadProgress, imagesUploadProgress } =
    useCreatePost()
  const form = useCreatePostForm()

  return usePostSteps({
    totalSteps: TOTAL_STEPS,
    form,
    propertyInfo,
    media,
    videoUploadProgress,
    imagesUploadProgress,
    isCreatePost: true,
  })
}
