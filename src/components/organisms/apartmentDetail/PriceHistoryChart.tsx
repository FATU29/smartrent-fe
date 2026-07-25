import React, { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/atoms/card'
import SectionHeading from '@/components/atoms/sectionHeading'
import { Tabs, TabsList, TabsTrigger } from '@/components/atoms/tabs'
import { Skeleton } from '@/components/atoms/skeleton'
import { ChartConfig, ChartContainer } from '@/components/atoms/chart'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { formatByLocale, formatCompactCurrency } from '@/utils/currency/convert'
import { cn } from '@/lib/utils'

import { usePricingHistory, usePriceStatistics } from '@/hooks/usePricing'
import {
  mockPricingHistory,
  mockPriceStatistics,
} from '@/mock/listingDetail/pricingHistory'
import { buildPriceChartModel, type Period } from './priceHistoryChart.utils'

const IS_DEV = process.env.NODE_ENV === 'development'

/** Show dots on the line when the series is small enough not to look busy. */
const DOT_THRESHOLD = 15

interface PriceHistoryChartProps {
  listingId: number
  newAddress?: string
  oldAddress?: string
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

const PriceTooltip = ({
  active,
  payload,
  label,
  avgPrice,
}: {
  active?: boolean
  payload?: Array<{ value: number; color: string }>
  label?: string
  avgPrice: number
}) => {
  if (!active || !payload?.length) return null
  const price = payload[0]?.value ?? 0
  const diff = price - avgPrice
  const diffPct = avgPrice > 0 ? ((diff / avgPrice) * 100).toFixed(1) : '0'
  const isAbove = diff > 0

  return (
    <div className='rounded-xl border border-border/60 bg-background/95 backdrop-blur-md px-3.5 py-2.5 shadow-2xl text-xs min-w-[170px]'>
      <p className='text-2xs font-medium text-muted-foreground mb-2 pb-1.5 border-b border-border/50'>
        {label}
      </p>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-1.5'>
          <div
            className='w-2 h-2 rounded-full flex-shrink-0'
            style={{ backgroundColor: payload[0]?.color }}
          />
          <span className='text-muted-foreground'>Giá thuê</span>
        </div>
        <span className='font-semibold tabular-nums text-foreground'>
          {formatByLocale(price, 'vi')}
        </span>
      </div>
      {avgPrice > 0 && diff !== 0 && (
        <div className='flex items-center justify-between gap-4 mt-1'>
          <span className='text-muted-foreground pl-3.5'>vs trung bình</span>
          <span
            className={cn(
              'font-medium tabular-nums',
              isAbove
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400',
            )}
          >
            {isAbove ? '+' : ''}
            {diffPct}%
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ listingId }) => {
  const t = useTranslations()
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1year')

  const { data: priceHistoryRaw, isLoading: isHistoryLoading } =
    usePricingHistory(listingId)

  const { data: priceStatisticsRaw } = usePriceStatistics(listingId, {
    enabled: !!listingId,
  })

  const priceHistory =
    priceHistoryRaw && priceHistoryRaw.length > 0
      ? priceHistoryRaw
      : IS_DEV
        ? mockPricingHistory
        : priceHistoryRaw

  const priceStatistics =
    priceStatisticsRaw ?? (IS_DEV ? mockPriceStatistics : undefined)

  const { chartData, statistics, yDomain } = useMemo(
    () => buildPriceChartModel(priceHistory, priceStatistics, selectedPeriod),
    [priceHistory, priceStatistics, selectedPeriod],
  )

  // ── Loading ──
  if (isHistoryLoading) {
    return (
      <div className='space-y-5'>
        <Skeleton className='h-7 w-56' />
        <div className='grid grid-cols-3 gap-3'>
          <Skeleton className='h-20 rounded-xl' />
          <Skeleton className='h-20 rounded-xl' />
          <Skeleton className='h-20 rounded-xl' />
        </div>
        <Skeleton className='h-[260px] w-full rounded-xl' />
      </div>
    )
  }

  if (
    !priceHistory ||
    !Array.isArray(priceHistory) ||
    priceHistory.length === 0
  ) {
    return null
  }
  if (!statistics || chartData.length === 0) return null

  const isPositive = statistics.changePercentage >= 0

  const chartConfig: ChartConfig = {
    price: {
      label: 'Giá thuê',
      color: 'var(--color-average)',
    },
  }

  return (
    <div className='space-y-5'>
      <SectionHeading title={t('apartmentDetail.priceHistory.simpleTitle')} />

      {/* Stat cards */}
      <div className='grid grid-cols-3 gap-3'>
        {/* Giá hiện tại — blue */}
        <Card className='py-0 border-blue-200 bg-blue-50/60 dark:border-blue-800 dark:bg-blue-950/30'>
          <CardContent className='p-4'>
            <p className='text-xs text-blue-600/80 dark:text-blue-400/80 mb-1'>
              Giá hiện tại
            </p>
            <p className='text-base font-bold text-blue-700 dark:text-blue-300 break-words leading-tight'>
              {formatByLocale(statistics.current, 'vi')}
            </p>
          </CardContent>
        </Card>

        {/* Biến động — emerald / red */}
        <Card
          className={cn(
            'py-0',
            isPositive
              ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30'
              : 'border-red-200 bg-red-50/60 dark:border-red-800 dark:bg-red-950/30',
          )}
        >
          <CardContent className='p-4'>
            <p
              className={cn(
                'text-xs mb-1',
                isPositive
                  ? 'text-emerald-600/80 dark:text-emerald-400/80'
                  : 'text-red-500/80 dark:text-red-400/80',
              )}
            >
              Biến động (
              {t(`apartmentDetail.priceHistory.period.${selectedPeriod}`)})
            </p>
            <div className='flex items-center gap-1.5'>
              {isPositive ? (
                <TrendingUp className='w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0' />
              ) : (
                <TrendingDown className='w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0' />
              )}
              <p
                className={cn(
                  'text-base font-bold',
                  isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-500 dark:text-red-400',
                )}
              >
                {statistics.changePercentage > 0 ? '+' : ''}
                {statistics.changePercentage}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Thay đổi giá — violet */}
        <Card className='py-0 border-violet-200 bg-violet-50/60 dark:border-violet-800 dark:bg-violet-950/30'>
          <CardContent className='p-4'>
            <p className='text-xs text-violet-600/80 dark:text-violet-400/80 mb-1'>
              Thay đổi giá
            </p>
            <p className='text-base font-bold text-violet-700 dark:text-violet-300'>
              {statistics.totalChanges} lần
            </p>
            <p className='text-xs mt-0.5'>
              <span className='text-emerald-600 dark:text-emerald-400'>
                ↑{statistics.priceIncreases}
              </span>
              {' · '}
              <span className='text-red-500 dark:text-red-400'>
                ↓{statistics.priceDecreases}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Period selector */}
      <Tabs
        value={selectedPeriod}
        onValueChange={(v) => setSelectedPeriod(v as Period)}
      >
        <TabsList>
          <TabsTrigger value='1year'>
            {t('apartmentDetail.priceHistory.period.1year')}
          </TabsTrigger>
          <TabsTrigger value='2years'>
            {t('apartmentDetail.priceHistory.period.2years')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Chart card */}
      <Card className='py-0'>
        <CardContent className='p-5'>
          <ChartContainer config={chartConfig} className='h-[220px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id='priceGradient'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop
                      offset='0%'
                      stopColor='var(--color-price)'
                      stopOpacity={0.35}
                    />
                    <stop
                      offset='100%'
                      stopColor='var(--color-price)'
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  strokeDasharray='3 3'
                  stroke='var(--border)'
                  strokeOpacity={0.6}
                />

                <XAxis
                  dataKey='i'
                  type='category'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={40}
                  tickFormatter={(v: number) => chartData[v]?.label ?? ''}
                  tick={{ fontSize: 11, fill: 'var(--foreground)' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: 'var(--foreground)' }}
                  tickFormatter={(v) => formatCompactCurrency(v, 'vi')}
                  width={44}
                  domain={yDomain}
                />

                <ReferenceLine
                  y={statistics.avgPrice}
                  stroke='var(--color-reference-line)'
                  strokeDasharray='5 4'
                  strokeWidth={1.5}
                  strokeOpacity={0.8}
                />

                <Tooltip
                  cursor={{
                    stroke: 'var(--muted-foreground)',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                    strokeOpacity: 0.5,
                  }}
                  content={({ active, payload, label }) => (
                    <PriceTooltip
                      active={active}
                      payload={
                        payload as Array<{ value: number; color: string }>
                      }
                      label={chartData[label as number]?.label ?? ''}
                      avgPrice={statistics.avgPrice}
                    />
                  )}
                />

                <Area
                  dataKey='price'
                  type='monotone'
                  fill='url(#priceGradient)'
                  stroke='var(--color-price)'
                  strokeWidth={2}
                  dot={
                    chartData.length <= DOT_THRESHOLD
                      ? {
                          r: 3,
                          fill: 'var(--color-price)',
                          strokeWidth: 0,
                        }
                      : false
                  }
                  activeDot={{
                    r: 5,
                    fill: 'var(--color-price)',
                    stroke: 'var(--background)',
                    strokeWidth: 2.5,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Min / Avg / Max below chart */}
          <div className='grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border'>
            <div className='rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 px-3 py-2.5'>
              <div className='flex items-center gap-1.5 mb-1'>
                <div className='w-2 h-2 rounded-full bg-red-400 flex-shrink-0' />
                <p className='text-2xs font-medium text-red-600/80 dark:text-red-400/80 truncate'>
                  {t('apartmentDetail.priceHistory.statistics.minPrice')}
                </p>
              </div>
              <p className='font-bold text-sm text-red-700 dark:text-red-300 break-words'>
                {formatByLocale(statistics.minPrice, 'vi')}
              </p>
            </div>

            <div className='rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 px-3 py-2.5'>
              <div className='flex items-center gap-1.5 mb-1'>
                <div
                  className='w-4 h-0.5 rounded-full bg-amber-400 flex-shrink-0'
                  style={{
                    borderTop: '2px dashed var(--color-reference-line)',
                    background: 'transparent',
                  }}
                />
                <p className='text-2xs font-medium text-amber-600/80 dark:text-amber-400/80 truncate'>
                  {t('apartmentDetail.priceHistory.statistics.avgPrice')}
                </p>
              </div>
              <p className='font-bold text-sm text-amber-700 dark:text-amber-300 break-words'>
                {formatByLocale(statistics.avgPrice, 'vi')}
              </p>
            </div>

            <div className='rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 px-3 py-2.5'>
              <div className='flex items-center gap-1.5 mb-1'>
                <div className='w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0' />
                <p className='text-2xs font-medium text-emerald-600/80 dark:text-emerald-400/80 truncate'>
                  {t('apartmentDetail.priceHistory.statistics.maxPrice')}
                </p>
              </div>
              <p className='font-bold text-sm text-emerald-700 dark:text-emerald-300 break-words'>
                {formatByLocale(statistics.maxPrice, 'vi')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data disclaimer */}
      <div className='flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 px-4 py-3'>
        <Info className='mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground' />
        <p className='text-xs leading-relaxed text-muted-foreground'>
          {t('apartmentDetail.priceHistory.dataNote')}
        </p>
      </div>
    </div>
  )
}

export default PriceHistoryChart
