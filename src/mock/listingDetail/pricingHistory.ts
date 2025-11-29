import { PriceHistory, PriceStatistics } from '@/api/types/property.type'

/**
 * Mock pricing history data for listing detail
 * Used for development and testing purposes
 */
export const mockPricingHistory: PriceHistory[] = [
  {
    id: 1,
    listingId: 1,
    oldPrice: 0,
    newPrice: 12000000,
    oldPriceUnit: 'MONTH',
    newPriceUnit: 'MONTH',
    changeType: 'INITIAL',
    changePercentage: 0,
    changeAmount: 0,
    changedBy: 'user-123',
    changeReason: 'Initial listing price',
    changedAt: '2024-01-15T10:00:00Z',
    current: false,
  },
  {
    id: 2,
    listingId: 1,
    oldPrice: 12000000,
    newPrice: 13000000,
    oldPriceUnit: 'MONTH',
    newPriceUnit: 'MONTH',
    changeType: 'INCREASE',
    changePercentage: 8.33,
    changeAmount: 1000000,
    changedBy: 'user-123',
    changeReason: 'Market adjustment',
    changedAt: '2024-02-20T14:30:00Z',
    current: false,
  },
  {
    id: 3,
    listingId: 1,
    oldPrice: 13000000,
    newPrice: 14500000,
    oldPriceUnit: 'MONTH',
    newPriceUnit: 'MONTH',
    changeType: 'INCREASE',
    changePercentage: 11.54,
    changeAmount: 1500000,
    changedBy: 'user-123',
    changeReason: 'Property improvements completed',
    changedAt: '2024-04-10T09:15:00Z',
    current: false,
  },
  {
    id: 4,
    listingId: 1,
    oldPrice: 14500000,
    newPrice: 15000000,
    oldPriceUnit: 'MONTH',
    newPriceUnit: 'MONTH',
    changeType: 'INCREASE',
    changePercentage: 3.45,
    changeAmount: 500000,
    changedBy: 'user-123',
    changeReason: 'Final price adjustment',
    changedAt: '2024-05-25T16:45:00Z',
    current: true,
  },
]

/**
 * Mock price statistics data for listing detail
 * Calculated from mockPricingHistory
 * Used for development and testing purposes
 */
export const mockPriceStatistics: PriceStatistics = {
  minPrice: 12000000,
  maxPrice: 15000000,
  avgPrice: 13625000,
  totalChanges: 4,
  priceIncreases: 3,
  priceDecreases: 0,
}
