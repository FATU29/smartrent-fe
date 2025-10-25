import React, { useState } from 'react'
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
import { TrendingUp, Info } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { PriceHistoryData } from '@/types/apartmentDetail.types'

interface PriceHistoryChartProps {
  priceHistory?: PriceHistoryData
  district?: string
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  priceHistory,
  district,
}) => {
  const t = useTranslations('apartmentDetail.priceHistory')
  const [selectedTab, setSelectedTab] = useState<'buy' | 'rent'>('buy')
  const [selectedPeriod, setSelectedPeriod] = useState<
    '1year' | '2years' | '5years'
  >('1year')

  if (
    !priceHistory ||
    !priceHistory.chartData ||
    priceHistory.chartData.length === 0
  ) {
    return null
  }

  // Transform data for recharts
  const chartData = priceHistory.chartData.map((d) => ({
    date: d.date,
    highest: d.highest || d.price,
    average: d.price,
    lowest: d.lowest || d.price,
  }))

  // Chart config following shadcn pattern
  const chartConfig: ChartConfig = {
    highest: {
      label: t('chartLabels.highest'),
      color: '#e5e7eb',
    },
    average: {
      label: t('chartLabels.average'),
      color: '#3b82f6',
    },
    lowest: {
      label: t('chartLabels.lowest'),
      color: '#fbbf24',
    },
  }

  return (
    <div className='space-y-6 py-8'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <Typography variant='h3' className='text-xl font-bold'>
          {t('title', { district: district || 'Phường 16, Quận Gò Vấp' })}
        </Typography>

        <Tabs
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as 'buy' | 'rent')}
        >
          <TabsList>
            <TabsTrigger value='buy'>{t('tabs.buy')}</TabsTrigger>
            <TabsTrigger value='rent'>{t('tabs.rent')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Summary */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <Typography variant='h2' className='text-3xl font-bold mb-1'>
              {priceHistory.current} {t('statistics.priceUnit')}
            </Typography>
            <Typography variant='small' className='text-muted-foreground'>
              {priceHistory.averagePrice.label}
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
                {priceHistory.changePercentage}%
              </Typography>
            </div>
            <Typography variant='small' className='text-emerald-700'>
              {t('increaseWithTime', {
                period: t('period.1year'),
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
              {priceHistory.highestPrice.label}
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
          <TabsTrigger value='1year'>{t('period.1year')}</TabsTrigger>
          <TabsTrigger value='2years'>{t('period.2years')}</TabsTrigger>
          <TabsTrigger value='5years'>{t('period.5years')}</TabsTrigger>
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
                  tickFormatter={(value) =>
                    `${new Intl.NumberFormat('vi-VN').format(value)}`
                  }
                />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator='dot' />}
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
          <Typography variant='small'>{t('chartLabels.highest')}</Typography>
        </div>
        <div className='flex items-center gap-2'>
          <Badge className='w-3 h-3 bg-blue-500 rounded-full p-0' />
          <Typography variant='small'>{t('chartLabels.average')}</Typography>
        </div>
        <div className='flex items-center gap-2'>
          <Badge className='w-3 h-3 bg-yellow-400 rounded-full p-0' />
          <Typography variant='small'>{t('chartLabels.lowest')}</Typography>
        </div>
        <div className='flex items-center gap-2'>
          <Badge className='w-3 h-3 bg-red-500 rounded-full p-0' />
          <Typography variant='small'>
            {t('chartLabels.searching', {
              price: priceHistory.pricePerSqm.toFixed(2),
            })}
          </Typography>
        </div>
      </div>

      {/* Statistics Summary */}
      <Card className='bg-muted/50'>
        <CardContent className='p-4'>
          <Typography variant='h6' className='font-semibold mb-3'>
            {t('statistics.title')}
          </Typography>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
            <div>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1'
              >
                {t('statistics.minPrice')}
              </Typography>
              <Typography variant='p' className='font-bold text-lg'>
                {priceHistory.minPrice} {t('statistics.priceUnit')}
              </Typography>
            </div>
            <div>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1'
              >
                {t('statistics.maxPrice')}
              </Typography>
              <Typography variant='p' className='font-bold text-lg'>
                {priceHistory.maxPrice} {t('statistics.priceUnit')}
              </Typography>
            </div>
            <div>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1'
              >
                {t('statistics.avgPrice')}
              </Typography>
              <Typography variant='p' className='font-bold text-lg'>
                {priceHistory.avgPrice} {t('statistics.priceUnit')}
              </Typography>
            </div>
            <div>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1'
              >
                {t('statistics.totalChanges')}
              </Typography>
              <Typography variant='p' className='font-bold text-lg'>
                {priceHistory.totalChanges} {t('statistics.times')}
              </Typography>
            </div>
            <div>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1'
              >
                {t('statistics.priceIncreases')}
              </Typography>
              <Typography
                variant='p'
                className='font-bold text-lg text-emerald-600'
              >
                {priceHistory.priceIncreases} {t('statistics.times')}
              </Typography>
            </div>
            <div>
              <Typography
                variant='small'
                className='text-muted-foreground mb-1'
              >
                {t('statistics.priceDecreases')}
              </Typography>
              <Typography
                variant='p'
                className='font-bold text-lg text-red-600'
              >
                {priceHistory.priceDecreases} {t('statistics.times')}
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className='bg-blue-50 border-blue-200'>
        <CardContent className='flex gap-3 p-4'>
          <Info className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
          <Typography variant='small' className='text-blue-900 leading-relaxed'>
            {t('disclaimer')}
          </Typography>
        </CardContent>
      </Card>
    </div>
  )
}

export default PriceHistoryChart
