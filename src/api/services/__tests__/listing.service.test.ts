import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ListingService } from '../listing.service'
import { apiRequest } from '@/configs/axios/instance'
import { PATHS } from '@/api/paths'
import type { CreateListingRequest } from '@/api/types/property.type'

// Mock the apiRequest function
vi.mock('@/configs/axios/instance', () => ({
  apiRequest: vi.fn(),
}))

describe('ListingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateAndResubmit', () => {
    it('should call the correct endpoint with PUT method', async () => {
      const listingId = 123
      const data: Partial<CreateListingRequest> = {
        title: 'Updated Title',
        description: 'Updated description',
      }
      const notes = 'Updated according to admin feedback'

      const mockResponse = {
        code: '999999',
        message: 'Listing updated and resubmitted for review successfully',
        data: null,
        success: true,
      }

      vi.mocked(apiRequest).mockResolvedValue(mockResponse)

      const result = await ListingService.updateAndResubmit(
        listingId,
        data,
        notes,
      )

      expect(apiRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: PATHS.LISTING.UPDATE_AND_RESUBMIT.replace(':id', '123'),
        data: { ...data, notes },
      })

      expect(result).toEqual(mockResponse)
    })

    it('should work without notes', async () => {
      const listingId = 456
      const data: Partial<CreateListingRequest> = {
        title: 'Updated Title',
      }

      const mockResponse = {
        code: '999999',
        message: 'Listing updated and resubmitted for review successfully',
        data: null,
        success: true,
      }

      vi.mocked(apiRequest).mockResolvedValue(mockResponse)

      const result = await ListingService.updateAndResubmit(listingId, data)

      expect(apiRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: PATHS.LISTING.UPDATE_AND_RESUBMIT.replace(':id', '456'),
        data,
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle string listing ID', async () => {
      const listingId = '789'
      const data: Partial<CreateListingRequest> = {
        price: 5000000,
      }

      const mockResponse = {
        code: '999999',
        message: 'Listing updated and resubmitted for review successfully',
        data: null,
        success: true,
      }

      vi.mocked(apiRequest).mockResolvedValue(mockResponse)

      await ListingService.updateAndResubmit(listingId, data)

      expect(apiRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: PATHS.LISTING.UPDATE_AND_RESUBMIT.replace(':id', '789'),
        data,
      })
    })

    it('should handle partial listing data', async () => {
      const listingId = 999
      const data: Partial<CreateListingRequest> = {
        title: 'New Title',
        price: 6000000,
        area: 65.5,
        bedrooms: 2,
        amenityIds: [1, 3, 5],
      }

      const mockResponse = {
        code: '999999',
        message: 'Listing updated and resubmitted for review successfully',
        data: null,
        success: true,
      }

      vi.mocked(apiRequest).mockResolvedValue(mockResponse)

      const result = await ListingService.updateAndResubmit(listingId, data)

      expect(apiRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: PATHS.LISTING.UPDATE_AND_RESUBMIT.replace(':id', '999'),
        data,
      })

      expect(result.success).toBe(true)
    })
  })
})
