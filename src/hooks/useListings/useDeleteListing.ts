import { useMutation } from '@tanstack/react-query'
import { deleteListing } from '@/api/services/listing.service'
import type { ApiResponse } from '@/configs/axios/types'

export const useDeleteListing = () => {
  return useMutation<ApiResponse<null>, Error, { id: string | number }>({
    mutationFn: ({ id }: { id: string | number }) => deleteListing(id),
  })
}
