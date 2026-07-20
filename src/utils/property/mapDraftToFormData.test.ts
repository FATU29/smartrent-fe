import { describe, it, expect } from 'vitest'
import { mapDraftToFormData } from './mapListingToFormData'
import type { DraftListingResponse } from '@/api/types/draft.type'

const makeDraft = (
  overrides: Partial<DraftListingResponse> = {},
): DraftListingResponse =>
  ({
    draftId: 1,
    userId: 'user-1',
    title: 'Căn hộ 2PN',
    description: 'Mô tả',
    listingType: 'RENT',
    vipType: 'GOLD',
    categoryId: 1,
    productType: 'APARTMENT',
    price: 5_000_000,
    priceUnit: 'MONTH',
    address: null,
    area: 45,
    bedrooms: 2,
    bathrooms: 1,
    direction: 'EAST',
    furnishing: 'FULLY_FURNISHED',
    roomCapacity: 4,
    waterPrice: 'NEGOTIABLE',
    electricityPrice: 'NEGOTIABLE',
    internetPrice: 'NEGOTIABLE',
    serviceFee: 'NEGOTIABLE',
    amenities: [],
    media: null,
    durationDays: null,
    useMembershipQuota: null,
    benefitIds: null,
    createdAt: '2026-07-20T10:00:00',
    updatedAt: '2026-07-20T10:00:00',
    ...overrides,
  }) as DraftListingResponse

describe('mapDraftToFormData — package selection round trip', () => {
  it('restores the duration, quota flag and benefit ids the draft was saved with', () => {
    const { propertyInfo } = mapDraftToFormData(
      makeDraft({
        durationDays: 30,
        useMembershipQuota: true,
        benefitIds: [7, 9],
      }),
    )

    // Losing these is what flipped the CTA from "Đăng tin" to "Thanh toán" and
    // asked the user to pay for a listing their membership already covered.
    expect(propertyInfo.durationDays).toBe(30)
    expect(propertyInfo.useMembershipQuota).toBe(true)
    expect(propertyInfo.benefitIds).toEqual([7, 9])
  })

  it('leaves the package fields undefined when the draft never had them', () => {
    const { propertyInfo } = mapDraftToFormData(makeDraft())

    expect(propertyInfo.durationDays).toBeUndefined()
    expect(propertyInfo.useMembershipQuota).toBeUndefined()
    expect(propertyInfo.benefitIds).toBeUndefined()
  })
})
