import { describe, expect, it } from 'vitest'

import type { HousingPredictorResponse } from '@/api/types/ai.type'

import { STRONG_DEVIATION_PERCENT, evaluateAskingPrice } from './priceEvaluation'

const prediction = (
  overrides: Partial<HousingPredictorResponse> = {},
): HousingPredictorResponse => ({
  price_range: { min: 5_000_000, max: 8_000_000 },
  location: 'Thanh Xuân, Hà Nội',
  property_type: 'APARTMENT',
  currency: 'VND',
  source: 'ai_comparables',
  listings_found: 12,
  confidence: 'medium',
  ...overrides,
})

describe('evaluateAskingPrice', () => {
  describe('inside the range', () => {
    it('is fair with no deviation', () => {
      const result = evaluateAskingPrice(6_500_000, 'MONTH', prediction())
      expect(result).toEqual({
        verdict: 'fair',
        severity: null,
        differencePercent: 0,
        normalizedMonthlyPrice: 6_500_000,
      })
    })

    it('treats the lower bound as fair', () => {
      expect(evaluateAskingPrice(5_000_000, 'MONTH', prediction())?.verdict).toBe(
        'fair',
      )
    })

    it('treats the upper bound as fair', () => {
      expect(evaluateAskingPrice(8_000_000, 'MONTH', prediction())?.verdict).toBe(
        'fair',
      )
    })
  })

  describe('above the range', () => {
    it('is mild at 10% over the max', () => {
      const result = evaluateAskingPrice(8_800_000, 'MONTH', prediction())
      expect(result?.verdict).toBe('above')
      expect(result?.severity).toBe('mild')
      expect(result?.differencePercent).toBe(10)
    })

    it('is strong at 50% over the max', () => {
      const result = evaluateAskingPrice(12_000_000, 'MONTH', prediction())
      expect(result?.verdict).toBe('above')
      expect(result?.severity).toBe('strong')
      expect(result?.differencePercent).toBe(50)
    })

    it('is still mild exactly at the threshold', () => {
      const atThreshold = 8_000_000 * (1 + STRONG_DEVIATION_PERCENT / 100)
      expect(evaluateAskingPrice(atThreshold, 'MONTH', prediction())?.severity).toBe(
        'mild',
      )
    })

    it('decides severity on the raw value, not the rounded one', () => {
      // 25.04% over the max rounds to 25.0 but must still count as strong.
      const justOver = 8_000_000 * 1.2504
      const result = evaluateAskingPrice(justOver, 'MONTH', prediction())
      expect(result?.differencePercent).toBe(25)
      expect(result?.severity).toBe('strong')
    })
  })

  describe('below the range', () => {
    it('is mild at 10% under the min', () => {
      const result = evaluateAskingPrice(4_500_000, 'MONTH', prediction())
      expect(result?.verdict).toBe('below')
      expect(result?.severity).toBe('mild')
      expect(result?.differencePercent).toBe(10)
    })

    it('is strong at 50% under the min', () => {
      const result = evaluateAskingPrice(2_500_000, 'MONTH', prediction())
      expect(result?.verdict).toBe('below')
      expect(result?.severity).toBe('strong')
      expect(result?.differencePercent).toBe(50)
    })
  })

  describe('unit conversion', () => {
    it('converts a yearly price to monthly before comparing', () => {
      // 78M/year = 6.5M/month, inside the range.
      const result = evaluateAskingPrice(78_000_000, 'YEAR', prediction())
      expect(result?.verdict).toBe('fair')
      expect(result?.normalizedMonthlyPrice).toBe(6_500_000)
    })

    it('does not compare a yearly price as if it were monthly', () => {
      // Without conversion this would read as wildly above the range.
      expect(evaluateAskingPrice(78_000_000, 'YEAR', prediction())?.verdict).not.toBe(
        'above',
      )
    })

    it('refuses units it cannot convert', () => {
      expect(evaluateAskingPrice(200_000, 'DAY', prediction())).toBeNull()
      expect(evaluateAskingPrice(6_500_000, undefined, prediction())).toBeNull()
    })
  })

  describe('unusable input', () => {
    it.each([undefined, 0, -1, NaN])('returns null for price %s', (price) => {
      expect(evaluateAskingPrice(price as number, 'MONTH', prediction())).toBeNull()
    })

    it('returns null without a prediction', () => {
      expect(evaluateAskingPrice(6_500_000, 'MONTH', null)).toBeNull()
    })

    it('returns null for an invalid range', () => {
      expect(
        evaluateAskingPrice(
          6_500_000,
          'MONTH',
          prediction({ price_range: { min: 0, max: 8_000_000 } }),
        ),
      ).toBeNull()
      expect(
        evaluateAskingPrice(
          6_500_000,
          'MONTH',
          prediction({ price_range: { min: 9_000_000, max: 8_000_000 } }),
        ),
      ).toBeNull()
    })
  })

  describe('evidence gating', () => {
    it('stays silent on a rule-based fallback range', () => {
      expect(
        evaluateAskingPrice(
          12_000_000,
          'MONTH',
          prediction({ source: 'rule_based_fallback' }),
        ),
      ).toBeNull()
    })

    it('stays silent when no comparable listings backed the range', () => {
      expect(
        evaluateAskingPrice(12_000_000, 'MONTH', prediction({ listings_found: 0 })),
      ).toBeNull()
    })

    it('still evaluates when the evidence fields are absent', () => {
      // Missing information is not evidence of a fallback; refusing here would
      // make the feature vanish silently whenever a field is omitted.
      const result = evaluateAskingPrice(
        6_500_000,
        'MONTH',
        prediction({ source: undefined, listings_found: undefined }),
      )
      expect(result?.verdict).toBe('fair')
    })
  })
})
