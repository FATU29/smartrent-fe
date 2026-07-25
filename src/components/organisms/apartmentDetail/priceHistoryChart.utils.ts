import type {
  PriceHistory,
  PriceStatistics,
} from '@/api/types/property.type'

export type Period = '1year' | '2years'

export const PERIOD_MONTHS: Record<Period, number> = {
  '1year': 12,
  '2years': 24,
}

export interface PriceChartPoint {
  /** Sequential index — used as the (unique) X-axis category so that several
   *  changes in the same month stay distinct points instead of overlapping. */
  i: number
  /** Human label shown on the X axis, e.g. `T7/26`. */
  label: string
  price: number
}

export interface PriceChartStatistics {
  current: number
  minPrice: number
  maxPrice: number
  avgPrice: number
  changePercentage: number
  totalChanges: number
  priceIncreases: number
  priceDecreases: number
}

export interface PriceChartModel {
  chartData: PriceChartPoint[]
  statistics: PriceChartStatistics | null
  /** Padded [min, max] so the Y axis never collapses to one repeated tick. */
  yDomain: [number, number]
}

const HAS_ZONE = /(?:Z|[+-]\d{2}:?\d{2})$/

/**
 * Parse a backend timestamp. The API sends local (Asia/Ho_Chi_Minh) times
 * without a zone, so we pin them to +07:00 — but only when no zone is already
 * present, otherwise appending an offset yields an Invalid Date.
 */
const toDate = (changedAt: string): Date =>
  new Date(
    HAS_ZONE.test(changedAt)
      ? changedAt
      : `${changedAt.replace(' ', 'T')}+07:00`,
  )

const monthYearLabel = (d: Date): string =>
  `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`

const EMPTY_MODEL: PriceChartModel = {
  chartData: [],
  statistics: null,
  yDomain: [0, 0],
}

/**
 * Build everything the price-history chart needs from raw history + optional
 * backend statistics.
 *
 * Key behaviour: one chart point per price-change event (the natural
 * resolution of the data — a row exists only when the price actually changed).
 * We deliberately do NOT collapse to one point per month: when every change
 * lands in the same calendar month that would degenerate the chart to a single
 * dot with no line and a collapsed axis.
 */
export function buildPriceChartModel(
  priceHistory: PriceHistory[] | undefined | null,
  priceStatistics: PriceStatistics | undefined | null,
  period: Period,
  now: Date = new Date(),
): PriceChartModel {
  if (
    !priceHistory ||
    !Array.isArray(priceHistory) ||
    priceHistory.length === 0
  ) {
    return EMPTY_MODEL
  }

  const sorted = [...priceHistory].sort(
    (a, b) => toDate(a.changedAt).getTime() - toDate(b.changedAt).getTime(),
  )

  const cutoff = new Date(now)
  cutoff.setMonth(cutoff.getMonth() - PERIOD_MONTHS[period])
  const display = sorted.filter((item) => toDate(item.changedAt) >= cutoff)
  const slice = display.length > 0 ? display : sorted

  const allPrices = sorted.map((p) => p.newPrice)
  const slicePrices = slice.map((p) => p.newPrice)

  const currentPrice = sorted.at(-1)?.newPrice ?? 0
  const firstPrice = slice.at(0)?.newPrice ?? currentPrice
  const changePercentage =
    firstPrice > 0
      ? Math.round(((currentPrice - firstPrice) / firstPrice) * 100)
      : 0

  const avgPrice =
    priceStatistics?.avgPrice ??
    Math.round(slicePrices.reduce((s, p) => s + p, 0) / slicePrices.length)

  let increases = 0
  let decreases = 0
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].newPrice > sorted[i - 1].newPrice) increases++
    else if (sorted[i].newPrice < sorted[i - 1].newPrice) decreases++
  }

  const chartData: PriceChartPoint[] = slice.map((item, i) => ({
    i,
    label: monthYearLabel(toDate(item.changedAt)),
    price: item.newPrice,
  }))

  const prices = chartData.map((d) => d.price)
  const lo = Math.min(...prices)
  const hi = Math.max(...prices)
  const pad = lo === hi ? Math.max(lo * 0.1, 1) : (hi - lo) * 0.15
  const yDomain: [number, number] = [
    Math.max(0, Math.floor(lo - pad)),
    Math.ceil(hi + pad),
  ]

  return {
    chartData,
    statistics: {
      current: currentPrice,
      minPrice: priceStatistics?.minPrice ?? Math.min(...allPrices),
      maxPrice: priceStatistics?.maxPrice ?? Math.max(...allPrices),
      avgPrice,
      changePercentage,
      totalChanges:
        priceStatistics?.totalChanges ?? Math.max(sorted.length - 1, 0),
      priceIncreases: priceStatistics?.priceIncreases ?? increases,
      priceDecreases: priceStatistics?.priceDecreases ?? decreases,
    },
    yDomain,
  }
}
