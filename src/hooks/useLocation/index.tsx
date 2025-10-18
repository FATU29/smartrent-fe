import { useLocationContext } from '@/contexts/location'

export const useLocation = () => {
  return useLocationContext()
}

export default useLocation
