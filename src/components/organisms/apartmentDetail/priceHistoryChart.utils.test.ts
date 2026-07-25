import { describe, it, expect } from 'vitest'
import { buildPriceChartModel } from './priceHistoryChart.utils'
import type { PriceHistory } from '@/api/types/property.type'

// Fixed "now" so the period cutoff is deterministic.
const NOW = new Date('2026-07-26T00:00:00+07:00')

const entry = (changedAt: string, newPrice: number): PriceHistory => ({
  id: newPrice,
  listingId: 1,
  oldPrice: null,
  newPrice,
  oldPriceUnit: null,
  newPriceUnit: 'MONTH',
  changeType: 'INCREASE',
  changePercentage: 0,
  changeAmount: 0,
  changedBy: 'u',
  changeReason: null,
  changedAt,
  current: false,
})

describe('buildPriceChartModel', () => {
  it('keeps every change as a distinct point when they all fall in one month (regression)', () => {
    // The reported bug: three edits, all in July 2026, previously collapsed to a
    // single point → the AreaChart drew no line.
    const model = buildPriceChartModel(
      [
        entry('2026-07-01T09:00:00', 6_200_000),
        entry('2026-07-10T09:00:00', 5_900_000),
        entry('2026-07-20T09:00:00', 5_700_000),
      ],
      undefined,
      '1year',
      NOW,
    )

    expect(model.chartData).toHaveLength(3)
    expect(model.chartData.map((d) => d.price)).toEqual([
      6_200_000, 5_900_000, 5_700_000,
    ])
    expect(model.chartData[0].label).toBe('T7/26')
    // Distinct X categories so recharts does not merge same-month points.
    expect(new Set(model.chartData.map((d) => d.i)).size).toBe(3)
  })

  it('produces a non-collapsed Y domain even for a single price point', () => {
    const model = buildPriceChartModel(
      [entry('2026-07-10T09:00:00', 5_700_000)],
      undefined,
      '1year',
      NOW,
    )

    expect(model.chartData).toHaveLength(1)
    expect(model.yDomain[0]).toBeLessThan(model.yDomain[1])
    expect(model.yDomain[0]).toBeGreaterThanOrEqual(0)
  })

  it('parses zoned (Z-suffixed) timestamps without corrupting them', () => {
    // Mock data uses `...Z`; appending +07:00 used to yield Invalid Date.
    const model = buildPriceChartModel(
      [
        entry('2025-08-10T08:00:00Z', 5_000_000),
        entry('2026-07-10T08:00:00Z', 5_700_000),
      ],
      undefined,
      '2years',
      NOW,
    )

    expect(model.chartData).toHaveLength(2)
    expect(model.chartData.every((d) => d.label !== 'TNaN/aN')).toBe(true)
  })

  it('spans multiple months and prefers backend statistics when provided', () => {
    const model = buildPriceChartModel(
      [
        entry('2026-01-10T09:00:00', 5_000_000),
        entry('2026-04-10T09:00:00', 5_500_000),
        entry('2026-07-10T09:00:00', 5_700_000),
      ],
      {
        minPrice: 4_800_000,
        maxPrice: 6_000_000,
        avgPrice: 5_400_000,
        totalChanges: 2,
        priceIncreases: 2,
        priceDecreases: 0,
      },
      '1year',
      NOW,
    )

    expect(model.chartData).toHaveLength(3)
    expect(model.statistics?.minPrice).toBe(4_800_000)
    expect(model.statistics?.avgPrice).toBe(5_400_000)
    expect(model.statistics?.changePercentage).toBe(14) // 5.0M → 5.7M
  })

  it('returns an empty model for no history', () => {
    expect(buildPriceChartModel([], undefined, '1year', NOW).chartData).toEqual(
      [],
    )
    expect(
      buildPriceChartModel(undefined, undefined, '1year', NOW).statistics,
    ).toBeNull()
  })
})
