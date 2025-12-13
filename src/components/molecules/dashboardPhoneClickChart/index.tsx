import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/atoms/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useDashboardPhoneClickStats } from '@/hooks/usePhoneClickDetails'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

const DashboardPhoneClickChart: React.FC = () => {
  const t = useTranslations('seller.dashboard.phoneClicks')
  const { data: stats, isLoading } = useDashboardPhoneClickStats()

  const chartData = useMemo(() => {
    if (!stats?.clicksByDate || stats.clicksByDate.length === 0) return []

    // Get last 7 days of data, or all available if less than 7
    const last7Days = stats.clicksByDate.slice(-7)

    // If we have less than 7 days, pad with empty days to show full week
    const today = new Date()
    const daysToShow = 7
    const result: Array<{ date: string; clicks: number; users: number }> = []

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dateFormatted = format(date, 'dd/MM')

      // Find matching data or use zero
      const existingData = last7Days.find((item) => item.date === dateStr)
      result.push({
        date: dateFormatted,
        clicks: existingData?.clicks || 0,
        users: existingData?.users || 0,
      })
    }

    return result
  }, [stats])

  const chartConfig: ChartConfig = {
    clicks: {
      label: t('clicks'),
      color: 'hsl(var(--chart-1))',
    },
    users: {
      label: t('uniqueUsers'),
      color: 'hsl(var(--chart-2))',
    },
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('clickTrends')}</CardTitle>
          <CardDescription>{t('last7Days')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-[300px]'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('clickTrends')}</CardTitle>
          <CardDescription>{t('last7Days')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-[300px] text-muted-foreground'>
            {t('noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('clickTrends')}</CardTitle>
        <CardDescription>{t('last7Days')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[300px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null
                  return (
                    <ChartTooltipContent
                      active={active}
                      payload={payload.map((item) => ({
                        color: item.color,
                        dataKey: String(item.dataKey || ''),
                        name: String(item.name || ''),
                        value: item.value,
                      }))}
                      labelFormatter={() => `${t('date')}: ${label}`}
                    />
                  )
                }}
              />
              <Bar
                dataKey='clicks'
                fill='var(--color-clicks)'
                radius={[4, 4, 0, 0]}
                name={t('clicks')}
              />
              <Bar
                dataKey='users'
                fill='var(--color-users)'
                radius={[4, 4, 0, 0]}
                name={t('uniqueUsers')}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default DashboardPhoneClickChart
