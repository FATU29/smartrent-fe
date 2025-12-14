import { useForm, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { getCreatePostSchema } from '@/utils/createPost/validationSchemas'
import type { CreateListingRequest } from '@/api/types/property.type'

export const useUpdatePostForm = () => {
  const validationSchema = getCreatePostSchema()

  const form = useForm<Partial<CreateListingRequest>>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<
      Partial<CreateListingRequest>
    >,
    defaultValues: {},
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  return form
}
