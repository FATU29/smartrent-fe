import type { HousingPredictorResponse } from '@/api/types/ai.type'
import type { PriceUnit } from '@/api/types/property.type'

export type PriceVerdict = 'below' | 'fair' | 'above'
export type PriceSeverity = 'mild' | 'strong'

export interface PriceEvaluation {
  verdict: PriceVerdict
  /** null when the verdict is 'fair' */
  severity: PriceSeverity | null
  /** Percent away from the nearest bound, rounded to 1 decimal. 0 when inside. */
  differencePercent: number
  /** The monthly VND figure actually compared against the range. */
  normalizedMonthlyPrice: number
}

/** Deviation beyond a range bound, in percent, past which the gap is reported
 *  as significant rather than moderate. A guess pending real feedback — named
 *  so it is cheap to retune. */
export const STRONG_DEVIATION_PERCENT = 25

const MONTHS_PER_YEAR = 12

const isPositiveFinite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

/** The AI always quotes a monthly rent, so a yearly asking price has to be
 *  brought onto the same footing before any comparison means anything. */
const toMonthly = (price: number, unit: PriceUnit | undefined): number | null => {
  if (unit === 'MONTH') return price
  if (unit === 'YEAR') return price / MONTHS_PER_YEAR
  // 'DAY' exists on the type but the create-post validation schema rejects it.
  // Refuse rather than invent a conversion factor and be wrong by ~30x.
  return null
}

export const evaluateAskingPrice = (
  price: number | undefined,
  priceUnit: PriceUnit | undefined,
  prediction: HousingPredictorResponse | null,
): PriceEvaluation | null => {
  if (!isPositiveFinite(price)) return null
  if (!prediction) return null

  // Say nothing when the range itself is not backed by market data. Claiming
  // "your price is 40% above market" off a hardcoded table would be worse than
  // staying quiet. Only positive evidence of unreliability suppresses the
  // verdict — absent fields do not.
  // Kept in sync by hand with the equivalent isFallbackEstimate check in
  // aiValuationSection.tsx - update both if either condition changes.
  if (prediction.source === 'rule_based_fallback') return null
  if (prediction.listings_found === 0) return null

  const min = prediction.price_range?.min
  const max = prediction.price_range?.max
  if (!isPositiveFinite(min) || !isPositiveFinite(max) || min > max) return null

  const monthly = toMonthly(price, priceUnit)
  if (monthly === null || !isPositiveFinite(monthly)) return null

  if (monthly >= min && monthly <= max) {
    return {
      verdict: 'fair',
      severity: null,
      differencePercent: 0,
      normalizedMonthlyPrice: monthly,
    }
  }

  const isBelow = monthly < min
  // Unrounded on purpose: rounding first would misfile 25.04% as mild.
  const rawDeviation = isBelow
    ? ((min - monthly) / min) * 100
    : ((monthly - max) / max) * 100
  const roundedDeviation = Math.round(rawDeviation * 10) / 10

  // A deviation that rounds to 0.0% reads, on screen, as no deviation at all -
  // report it as fair rather than an "above"/"below" verdict paired with a 0%
  // gap. The rounded value decides this, not the raw one, since it is the
  // rounded value the user actually sees.
  if (roundedDeviation === 0) {
    return {
      verdict: 'fair',
      severity: null,
      differencePercent: 0,
      normalizedMonthlyPrice: monthly,
    }
  }

  return {
    verdict: isBelow ? 'below' : 'above',
    severity: rawDeviation > STRONG_DEVIATION_PERCENT ? 'strong' : 'mild',
    differencePercent: roundedDeviation,
    normalizedMonthlyPrice: monthly,
  }
}
