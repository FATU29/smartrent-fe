import { useForm, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useUpdatePost } from '@/contexts/updatePost'
import { getCreatePostSchema } from '@/utils/createPost/validationSchemas'
import { getFormDefaultValues } from '@/components/templates/shared/form.utils'
import type { CreateListingRequest } from '@/api/types/property.type'
import { useEffect } from 'react'

export const useUpdatePostForm = () => {
  const { propertyInfo } = useUpdatePost()

  const validationSchema = getCreatePostSchema()
  const form = useForm<Partial<CreateListingRequest>>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<
      Partial<CreateListingRequest>
    >,
    defaultValues: getFormDefaultValues(propertyInfo),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  // Sync form values when propertyInfo changes (for initial load and updates)
  useEffect(() => {
    if (propertyInfo && Object.keys(propertyInfo).length > 0) {
      form.reset(getFormDefaultValues(propertyInfo))
    }
  }, [propertyInfo, form])

  return form
}
