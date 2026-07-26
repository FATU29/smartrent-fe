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
  /** Compact X-axis label by change date, e.g. `25/7` (or `25/7/26` when the
   *  series spans more than one year). Day-level so same-month changes differ. */
  label: string
  /** Full date for the tooltip, e.g. `25/07/2026`. */
  fullLabel: string
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

const pad2 = (n: number): string => String(n).padStart(2, '0')

/**
 * Read the calendar Y/M/D straight from the timestamp string rather than from a
 * `Date` object. Backend times are already Vietnam wall-clock, so this keeps
 * axis labels stable regardless of the JS runtime's timezone (a UTC test runner
 * or a browser in another zone would otherwise shift the day across midnight).
 */
const parseYmd = (
  changedAt: string,
): { y: number; m: number; d: number } | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(changedAt)
  if (!match) return null
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) }
}

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

  // Show the year on the axis only when the series actually crosses years —
  // otherwise the day/month alone keeps same-month points readable and distinct.
  const spansYears =
    new Set(
      slice
        .map((item) => parseYmd(item.changedAt)?.y)
        .filter((y) => y !== undefined),
    ).size > 1

  const chartData: PriceChartPoint[] = slice.map((item, i) => {
    const ymd = parseYmd(item.changedAt)
    if (!ymd) return { i, label: '', fullLabel: '', price: item.newPrice }
    const dayMonth = `${ymd.d}/${ymd.m}`
    return {
      i,
      label: spansYears ? `${dayMonth}/${String(ymd.y).slice(-2)}` : dayMonth,
      fullLabel: `${pad2(ymd.d)}/${pad2(ymd.m)}/${ymd.y}`,
      price: item.newPrice,
    }
  })

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
