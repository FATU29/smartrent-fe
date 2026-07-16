import { describe, it, expect } from 'vitest'
import { resolveBenefitVipType } from './benefitTier'
import {
  BenefitStatus,
  BenefitType,
  type UserBenefit,
} from '@/api/types/membership.type'

const makeBenefit = (overrides: Partial<UserBenefit> = {}): UserBenefit => ({
  userBenefitId: 1,
  benefitType: BenefitType.POST_GOLD,
  benefitNameDisplay: 'Gold posts',
  grantedAt: '2026-01-01T00:00:00',
  expiresAt: '2026-12-31T00:00:00',
  totalQuantity: 5,
  quantityUsed: 0,
  quantityRemaining: 5,
  status: BenefitStatus.ACTIVE,
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
  ...overrides,
})

describe('resolveBenefitVipType', () => {
  it('prefers the tier code resolved by the backend', () => {
    const benefit = makeBenefit({
      benefitType: BenefitType.POST_GOLD,
      vipTierCode: 'DIAMOND',
    })
    expect(resolveBenefitVipType(benefit)).toBe('DIAMOND')
  })

  it.each([
    [BenefitType.POST_SILVER, 'SILVER'],
    [BenefitType.POST_GOLD, 'GOLD'],
    [BenefitType.POST_DIAMOND, 'DIAMOND'],
    [BenefitType.POST_NORMAL, 'NORMAL'],
    [BenefitType.POST_STANDARD, 'NORMAL'],
  ])('falls back to the benefit type: %s -> %s', (benefitType, expected) => {
    const benefit = makeBenefit({ benefitType, vipTierCode: null })
    expect(resolveBenefitVipType(benefit)).toBe(expected)
  })

  it('ignores a tier code the app does not know', () => {
    const benefit = makeBenefit({
      benefitType: BenefitType.POST_SILVER,
      vipTierCode: 'PLATINUM',
    })
    expect(resolveBenefitVipType(benefit)).toBe('SILVER')
  })

  it('returns undefined for benefits that do not create a listing', () => {
    const benefit = makeBenefit({
      benefitType: BenefitType.PUSH,
      vipTierCode: null,
    })
    expect(resolveBenefitVipType(benefit)).toBeUndefined()
  })

  it('returns undefined when no benefit is selected', () => {
    expect(resolveBenefitVipType(undefined)).toBeUndefined()
  })
})
