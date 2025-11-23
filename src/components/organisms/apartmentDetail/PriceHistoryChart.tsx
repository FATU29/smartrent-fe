import React, { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Card, CardContent } from '@/components/atoms/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/atoms/tabs'
import { Badge } from '@/components/atoms/badge'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/atoms/chart'
import { TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { PriceHistory, PriceStatistics } from '@/api/types'
import { formatByLocale, formatCompactCurrency } from '@/utils/currency/convert'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'

interface PriceHistoryChartProps {
  priceHistory?: PriceHistory[]
  priceStatistics?: PriceStatistics | null
  newAddress?: string
  oldAddress?: string
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  priceHistory,
  priceStatistics,
  newAddress,
  oldAddress,
}) => {
  const t = useTranslations()
  const { language } = useSwitchLanguage()
  // Ensure locale is properly set and reactive to language changes
  const locale = useMemo(() => language || 'vi', [language])
  const [selectedPeriod, setSelectedPeriod] = useState<
    '1year' | '2years' | '5years'
  >('1year')

  // Transform PriceHistory[] to chart data and calculate statistics
  const { chartData, statistics } = useMemo(() => {
    // Check if priceHistory is an array and has data
    if (
      !priceHistory ||
      !Array.isArray(priceHistory) ||
      priceHistory.length === 0
    ) {
      return { chartData: [], statistics: null }
    }

    // Sort by date (oldest first)
    const sorted = [...priceHistory].sort(
      (a, b) =>
        new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
    )

    // Calculate statistics from priceHistory for chart data
    const prices = sorted.map((item) => item.newPrice)
    const overallAvg =
      priceStatistics?.avgPrice ||
      Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)

    // Transform to chart data format
    const transformed = sorted.map((item) => ({
      date: new Date(item.changedAt).toLocaleDateString('vi-VN', {
        month: 'short',
        year: 'numeric',
      }),
      price: item.newPrice,
      average: overallAvg, // Add average to each data point
      highest: item.newPrice,
      lowest: item.newPrice,
    }))

    const currentPrice = sorted[sorted.length - 1]?.newPrice || 0
    const firstPrice = sorted[0]?.newPrice || 0
    const changePercentage =
      firstPrice > 0
        ? Math.round(((currentPrice - firstPrice) / firstPrice) * 100)
        : 0

    // Calculate highest/lowest for each date point (using rolling window)
    const chartDataWithRange = transformed.map((item, index) => {
      const windowStart = Math.max(0, index - 5)
      const windowEnd = index + 1
      const windowPrices = prices.slice(windowStart, windowEnd)
      return {
        ...item,
        highest: Math.max(...windowPrices),
        lowest: Math.min(...windowPrices),
      }
    })

    // Use API statistics directly - no calculation needed
    if (!priceStatistics) {
      return { chartData: chartDataWithRange, statistics: null }
    }

    return {
      chartData: chartDataWithRange,
      statistics: {
        current: currentPrice,
        minPrice: priceStatistics.minPrice,
        maxPrice: priceStatistics.maxPrice,
        avgPrice: priceStatistics.avgPrice,
        changePercentage,
        totalChanges: priceStatistics.totalChanges,
        priceIncreases: priceStatistics.priceIncreases,
        priceDecreases: priceStatistics.priceDecreases,
        pricePerSqm: currentPrice,
      },
    }
  }, [priceHistory, priceStatistics, locale])

  if (
    !priceHistory ||
    !Array.isArray(priceHistory) ||
    priceHistory.length === 0 ||
    !statistics
  ) {
    return null
  }

  // Chart config following shadcn pattern
  const chartConfig: ChartConfig = {
    highest: {
      label: t('apartmentDetail.priceHistory.chartLabels.highest'),
      color: '#e5e7eb',
    },
    average: {
      label: t('apartmentDetail.priceHistory.chartLabels.average'),
      color: '#3b82f6',
    },
    lowest: {
      label: t('apartmentDetail.priceHistory.chartLabels.lowest'),
      color: '#fbbf24',
    },
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-3'>
        <Typography variant='h3' className='text-xl font-bold'>
          {t('apartmentDetail.sections.priceHistory', {
            district: newAddress || oldAddress || '',
          })}
        </Typography>
        <div>
          {newAddress && (
            <Typography variant='p' className='text-base text-muted-foreground'>
              {t('apartmentDetail.property.newAddress')}: {newAddress}
            </Typography>
          )}
          {oldAddress && (
            <Typography variant='p' className='text-base text-muted-foreground'>
              {t('apartmentDetail.property.legacyAddress')}: {oldAddress}
            </Typography>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <Typography
              variant='h2'
              className='text-xl sm:text-2xl font-bold mb-1 break-words'
            >
              {formatByLocale(statistics.current, locale)}{' '}
              {t('apartmentDetail.priceHistory.statistics.priceUnit')}
            </Typography>
            <Typography variant='small' className='text-muted-foreground'>
              {t('apartmentDetail.priceHistory.statistics.avgPrice')}
            </Typography>
          </CardContent>
        </Card>

        <Card className='bg-emerald-50 border-emerald-200'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingUp className='w-5 h-5 text-emerald-600' />
              <Typography
                variant='h2'
                className='text-3xl font-bold text-emerald-600'
              >
                {statistics.changePercentage > 0 ? '+' : ''}
                {statistics.changePercentage}%
              </Typography>
            </div>
            <Typography variant='small' className='text-emerald-700'>
              {t('apartmentDetail.priceHistory.increaseWithTime', {
                period: t('apartmentDetail.priceHistory.period.1year'),
                timeRange: 'T9/24 - T9/25',
              })}
            </Typography>
          </CardContent>
        </Card>

        <Card className='bg-blue-50 border-blue-200'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='flex -space-x-1'>
                <Badge className='w-6 h-6 bg-blue-400 rounded-full border-2 border-white p-0' />
                <Badge className='w-6 h-6 bg-blue-500 rounded-full border-2 border-white p-0' />
                <Badge className='w-6 h-6 bg-blue-600 rounded-full border-2 border-white p-0' />
              </div>
            </div>
            <Typography variant='small' className='text-blue-700'>
              {t('apartmentDetail.priceHistory.chartLabels.highest')}
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Period Selector */}
      <Tabs
        value={selectedPeriod}
        onValueChange={(value) =>
          setSelectedPeriod(value as '1year' | '2years' | '5years')
        }
      >
        <TabsList>
          <TabsTrigger value='1year'>
            {t('apartmentDetail.priceHistory.period.1year')}
          </TabsTrigger>
          <TabsTrigger value='2years'>
            {t('apartmentDetail.priceHistory.period.2years')}
          </TabsTrigger>
          <TabsTrigger value='5years'>
            {t('apartmentDetail.priceHistory.period.5years')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Chart */}
      <Card>
        <CardContent className='p-6'>
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[300px] w-full'
          >
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id='fillHighest' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-highest)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-highest)'
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id='fillAverage' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-average)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-average)'
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id='fillLowest' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-lowest)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-lowest)'
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis
                  dataKey='date'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    return formatCompactCurrency(value, locale)
                  }}
                />
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null
                    return (
                      <ChartTooltipContent
                        indicator='dot'
                        active={active}
                        payload={payload.map((item) => ({
                          color: item.color,
                          dataKey: String(item.dataKey || ''),
                          name: String(item.name || ''),
                          value: formatByLocale(
                            Number(item.value) || 0,
                            locale,
                          ),
                        }))}
                      />
                    )
                  }}
                />
                <Area
                  dataKey='lowest'
                  type='monotone'
                  fill='url(#fillLowest)'
                  stroke='var(--color-lowest)'
                  strokeWidth={2}
                />
                <Area
                  dataKey='average'
                  type='monotone'
                  fill='url(#fillAverage)'
                  stroke='var(--color-average)'
                  strokeWidth={2}
                />
                <Area
                  dataKey='highest'
                  type='monotone'
                  fill='url(#fillHighest)'
                  stroke='var(--color-highest)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className='flex flex-wrap gap-4 text-sm'>
        <div className='flex items-center gap-2'>
          <Badge className='w-3 h-3 bg-gray-300 rounded-full p-0' />
          <Typography variant='small'>
            {t('apartmentDetail.priceHistory.chartLabels.highest')}
          </Typography>
        </div>
        <div className='flex items-center gap-2'>
          <Badge className='w-3 h-3 bg-blue-500 rounded-full p-0' />
          <Typography variant='small'>
            {t('apartmentDetail.priceHistory.chartLabels.average')}
          </Typography>
        </div>
        <div className='flex items-center gap-2'>
          <Badge className='w-3 h-3 bg-yellow-400 rounded-full p-0' />
          <Typography variant='small'>
            {t('apartmentDetail.priceHistory.chartLabels.lowest')}
          </Typography>
        </div>
        <div className='flex items-center gap-2'>
          <Badge className='w-3 h-3 bg-red-500 rounded-full p-0' />
          <Typography variant='small'>
            {t('apartmentDetail.priceHistory.chartLabels.searching', {
              price: formatByLocale(statistics.pricePerSqm, locale),
            })}
          </Typography>
        </div>
      </div>

      {/* Statistics Summary */}
      <Card className='bg-muted/50'>
        <CardContent className='p-4'>
          <Typography variant='h6' className='font-semibold mb-3'>
            {t('apartmentDetail.priceHistory.statistics.title')}
          </Typography>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
            <div>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1'
              >
                {t('apartmentDetail.priceHistory.statistics.minPrice')}
              </Typography>
              <Typography
                variant='p'
                className='font-bold text-sm sm:text-base break-words'
              >
                {formatByLocale(statistics.minPrice, locale)}{' '}
                {t('apartmentDetail.priceHistory.statistics.priceUnit')}
              </Typography>
            </div>
            <div>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1'
              >
                {t('apartmentDetail.priceHistory.statistics.maxPrice')}
              </Typography>
              <Typography
                variant='p'
                className='font-bold text-sm sm:text-base break-words'
              >
                {formatByLocale(statistics.maxPrice, locale)}{' '}
                {t('apartmentDetail.priceHistory.statistics.priceUnit')}
              </Typography>
            </div>
            <div>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1'
              >
                {t('apartmentDetail.priceHistory.statistics.avgPrice')}
              </Typography>
              <Typography
                variant='p'
                className='font-bold text-sm sm:text-base break-words'
              >
                {formatByLocale(statistics.avgPrice, locale)}{' '}
                {t('apartmentDetail.priceHistory.statistics.priceUnit')}
              </Typography>
            </div>
            <div>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1'
              >
                {t('apartmentDetail.priceHistory.statistics.totalChanges')}
              </Typography>
              <Typography variant='p' className='font-bold text-lg'>
                {statistics.totalChanges}{' '}
                {t('apartmentDetail.priceHistory.statistics.times')}
              </Typography>
            </div>
            <div>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1'
              >
                {t('apartmentDetail.priceHistory.statistics.priceIncreases')}
              </Typography>
              <Typography
                variant='p'
                className='font-bold text-lg text-emerald-600'
              >
                {statistics.priceIncreases}{' '}
                {t('apartmentDetail.priceHistory.statistics.times')}
              </Typography>
            </div>
            <div>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1'
              >
                {t('apartmentDetail.priceHistory.statistics.priceDecreases')}
              </Typography>
              <Typography
                variant='p'
                className='font-bold text-lg text-red-600'
              >
                {statistics.priceDecreases}{' '}
                {t('apartmentDetail.priceHistory.statistics.times')}
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PriceHistoryChart
