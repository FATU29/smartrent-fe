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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table'
import { Button } from '@/components/atoms/button'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Loader2, Heart } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type {
  ListingSaveSummary,
  OwnerListingSavesTrendResponse,
} from '@/api/types'

interface DashboardSavedListingsChartProps {
  listings: ListingSaveSummary[]
  totalSavesAcrossAll: number
  selectedListingId?: number | null
  trend?: OwnerListingSavesTrendResponse | null
  isSummaryLoading?: boolean
  isDetailLoading?: boolean
  onSelectListing?: (listingId: number) => void
}

const BAR_COLORS = [
  '#f59e0b',
  '#6366f1',
  '#10b981',
  '#ef4444',
  '#3b82f6',
  '#8b5cf6',
]

const DashboardSavedListingsChart: React.FC<
  DashboardSavedListingsChartProps
> = ({
  listings,
  totalSavesAcrossAll,
  selectedListingId,
  trend,
  isSummaryLoading = false,
  isDetailLoading = false,
  onSelectListing,
}) => {
  const t = useTranslations('seller.dashboard.savedListings')

  const handleSelectListing = (listingId: number) => {
    onSelectListing?.(listingId)

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const target = document.getElementById(
            'saved-listings-analytics-title',
          )
          target?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
          })
        })
      })
    }
  }

  const savesOverTimeData = useMemo(() => {
    if (!trend?.savesOverTime || trend.savesOverTime.length === 0) {
      return []
    }

    return trend.savesOverTime.map((item) => ({
      date: format(parseISO(item.date), 'dd/MM'),
      count: item.count,
    }))
  }, [trend?.savesOverTime])

  const barChartData = useMemo(() => {
    return listings.map((item) => ({
      name:
        item.listingTitle.length > 25
          ? `${item.listingTitle.substring(0, 25)}…`
          : item.listingTitle,
      totalSaves: item.totalSaves,
      listingId: item.listingId,
    }))
  }, [listings])

  const chartConfig: ChartConfig = {
    saves: {
      label: t('saves'),
      color: 'var(--chart-1)',
    },
    totalSaves: {
      label: t('totalSaves'),
      color: 'var(--chart-2)',
    },
  }

  if (isSummaryLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('overview')}</CardTitle>
          <CardDescription>{t('loading')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-[260px]'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (listings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('overview')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-[260px] text-muted-foreground'>
            {t('noListings')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('overview')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='rounded-lg border bg-muted/20 p-4'>
          <div className='flex items-center gap-2 text-muted-foreground text-sm'>
            <Heart className='h-4 w-4 text-amber-500' />
            {t('totalSavesAcrossAll')}
          </div>
          <p className='mt-1 text-3xl font-bold text-foreground'>
            {totalSavesAcrossAll}
          </p>
        </div>

        <div className='space-y-2'>
          <p className='text-sm font-medium'>{t('listing')}</p>
          <Select
            value={selectedListingId ? String(selectedListingId) : undefined}
            onValueChange={(value) => handleSelectListing(Number(value))}
          >
            <SelectTrigger className='w-full md:w-[360px]'>
              <SelectValue placeholder={t('selectListing')} />
            </SelectTrigger>
            <SelectContent>
              {listings.map((listing) => (
                <SelectItem
                  key={listing.listingId}
                  value={String(listing.listingId)}
                >
                  {listing.listingTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='min-h-[260px]'>
          {isDetailLoading ? (
            <div className='flex items-center justify-center h-[260px]'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          ) : trend ? (
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
              <Card id='saved-listing-trend-chart'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-base'>
                    {t('savesOverTime')}
                  </CardTitle>
                  <CardDescription>
                    {trend.listingTitle} · {t('totalSaves')}: {trend.totalSaves}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    className='h-[260px] w-full'
                  >
                    <ResponsiveContainer width='100%' height='100%'>
                      <AreaChart data={savesOverTimeData}>
                        <defs>
                          <linearGradient
                            id='colorSavesTrend'
                            x1='0'
                            y1='0'
                            x2='0'
                            y2='1'
                          >
                            <stop
                              offset='5%'
                              stopColor='var(--color-saves)'
                              stopOpacity={0.5}
                            />
                            <stop
                              offset='95%'
                              stopColor='var(--color-saves)'
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray='3 3' vertical={false} />
                        <XAxis
                          dataKey='date'
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          allowDecimals={false}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || payload.length === 0) {
                              return null
                            }

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
                        <Area
                          type='monotone'
                          dataKey='count'
                          name={t('saves')}
                          stroke='var(--color-saves)'
                          fill='url(#colorSavesTrend)'
                          fillOpacity={1}
                          strokeWidth={2.5}
                          connectNulls
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-base'>
                    {t('savesByListing')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    className='h-[260px] w-full'
                  >
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={barChartData} layout='vertical'>
                        <CartesianGrid
                          strokeDasharray='3 3'
                          horizontal={false}
                        />
                        <XAxis
                          type='number'
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          allowDecimals={false}
                        />
                        <YAxis
                          type='category'
                          dataKey='name'
                          width={180}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || payload.length === 0) {
                              return null
                            }

                            return (
                              <ChartTooltipContent
                                active={active}
                                payload={payload.map((item) => ({
                                  color: item.color,
                                  dataKey: String(item.dataKey || ''),
                                  name: String(item.name || ''),
                                  value: item.value,
                                }))}
                                labelFormatter={() => String(label)}
                              />
                            )
                          }}
                        />
                        <Bar
                          dataKey='totalSaves'
                          name={t('saves')}
                          radius={[0, 6, 6, 0]}
                        >
                          {barChartData.map((item, index) => (
                            <Cell
                              key={`saved-listing-${item.listingId}`}
                              fill={BAR_COLORS[index % BAR_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className='flex items-center justify-center h-[260px] text-muted-foreground'>
              {t('noData')}
            </div>
          )}
        </div>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base'>{t('allListings')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('listing')}</TableHead>
                  <TableHead className='text-right'>
                    {t('totalSaves')}
                  </TableHead>
                  <TableHead className='text-right'>{t('action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.listingId}>
                    <TableCell className='font-medium'>
                      {listing.listingTitle}
                    </TableCell>
                    <TableCell className='text-right'>
                      {listing.totalSaves}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleSelectListing(listing.listingId)}
                      >
                        {t('viewTrend')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

export default DashboardSavedListingsChart
