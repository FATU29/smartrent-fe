import { useForm, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useCreatePost } from '@/contexts/createPost'
import { getCreatePostSchema } from '@/utils/createPost/validationSchemas'
import { getFormDefaultValues } from '@/components/templates/shared/form.utils'
import type { CreateListingRequest } from '@/api/types/property.type'

export const useCreatePostForm = () => {
  const { propertyInfo } = useCreatePost()

  const validationSchema = getCreatePostSchema()
  const form = useForm<Partial<CreateListingRequest>>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<
      Partial<CreateListingRequest>
    >,
    defaultValues: getFormDefaultValues(propertyInfo),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  return form
}
