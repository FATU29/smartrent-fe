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
import Combobox from '@/components/atoms/combobox'
import { SavedListingService } from '@/api/services'
import { Input } from '@/components/atoms/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
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
import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns'
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
  // paging + search
  currentPage?: number
  totalPages?: number
  totalElements?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  searchKeyword?: string
  onSearchKeywordChange?: (kw: string) => void
  // period filter for trend
  period?: '7d' | '30d' | '90d' | '180d' | '365d' | 'all'
  onPeriodChange?: (p: '7d' | '30d' | '90d' | '180d' | '365d' | 'all') => void
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
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchKeyword,
  onSearchKeywordChange,
  period = '30d',
  onPeriodChange,
}) => {
  const t = useTranslations('seller.dashboard.savedListings')
  // Independent dropdown paging state (decoupled from table)
  const [selectKeyword, setSelectKeyword] = React.useState('')
  const [selectPage, setSelectPage] = React.useState(0)
  const [selectPageSize] = React.useState(20)
  const [selectHasMore, setSelectHasMore] = React.useState(true)
  const [selectLoading, setSelectLoading] = React.useState(false)
  const [selectLoadingMore, setSelectLoadingMore] = React.useState(false)
  const [selectOptions, setSelectOptions] = React.useState<
    { listingId: number; listingTitle: string; totalSaves: number }[]
  >([])

  const loadSelectPage = React.useCallback(
    async (page: number, append: boolean) => {
      try {
        if (append) {
          setSelectLoadingMore(true)
        } else {
          setSelectLoading(true)
        }
        const resp = selectKeyword.trim()
          ? await SavedListingService.searchOwnerSavesAnalytics({
              keyword: selectKeyword.trim(),
              page,
              size: selectPageSize,
            })
          : await SavedListingService.getOwnerSavesAnalyticsPage(
              page,
              selectPageSize,
            )
        if (resp.code !== '999999' || !resp.data) {
          throw new Error(resp.message || 'Failed to load options')
        }
        const nextListings = resp.data.listings || []
        setSelectOptions((prev) =>
          append ? [...prev, ...nextListings] : nextListings,
        )
        const hasMore =
          typeof resp.data.currentPage === 'number' &&
          typeof resp.data.totalPages === 'number'
            ? resp.data.currentPage + 1 < resp.data.totalPages
            : nextListings.length === selectPageSize
        setSelectHasMore(hasMore)
        setSelectPage(page)
      } finally {
        setSelectLoading(false)
        setSelectLoadingMore(false)
      }
    },
    [selectKeyword, selectPageSize],
  )

  // Initialize dropdown options on mount and when keyword changes
  React.useEffect(() => {
    loadSelectPage(0, false).catch(() => {
      setSelectOptions([])
      setSelectHasMore(false)
    })
  }, [loadSelectPage])

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
    if (!trend?.savesOverTime) {
      return []
    }

    const raw = trend.savesOverTime
    if (raw.length === 0) {
      return []
    }

    const periodToDays = (p: typeof period): number | null => {
      switch (p) {
        case '7d':
          return 7
        case '30d':
          return 30
        case '90d':
          return 90
        case '180d':
          return 180
        case '365d':
          return 365
        default:
          return null
      }
    }

    const days = periodToDays(period)
    if (!days) {
      // 'all' → show as returned
      return raw
        .map((item) => ({
          date: format(parseISO(item.date), 'dd/MM'),
          count: item.count,
        }))
        .sort((a, b) => {
          // sort by day/month display – approximate chronological by parsing with current year
          const [ad, am] = a.date.split('/').map(Number)
          const [bd, bm] = b.date.split('/').map(Number)
          return (
            new Date(2000, am - 1, ad).getTime() -
            new Date(2000, bm - 1, bd).getTime()
          )
        })
    }

    // Fill missing days in range [today - (days-1), today]
    const today = new Date()
    const start = subDays(today, days - 1)
    const dateKeys = new Map<string, number>()
    for (const item of raw) {
      dateKeys.set(item.date, item.count)
    }
    const filled = eachDayOfInterval({ start, end: today }).map((d) => {
      const key = format(d, 'yyyy-MM-dd')
      return {
        date: format(d, 'dd/MM'),
        count: dateKeys.get(key) ?? 0,
      }
    })
    return filled
  }, [trend?.savesOverTime, period])

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
          <div className='w-full md:w-[360px]'>
            <Combobox
              value={selectedListingId ? String(selectedListingId) : ''}
              onValueChange={(v) => {
                if (!v) return
                handleSelectListing(Number(v))
              }}
              onSearchChange={(v) => {
                setSelectKeyword(v)
                // reset and reload first page
                loadSelectPage(0, false).catch(() => {})
              }}
              loading={selectLoading}
              isLoadingMore={selectLoadingMore}
              hasMore={selectHasMore}
              onLoadMore={() => {
                if (selectHasMore && !selectLoadingMore) {
                  loadSelectPage(selectPage + 1, true).catch(() => {})
                }
              }}
              options={selectOptions.map((l) => ({
                value: String(l.listingId),
                label: l.listingTitle,
              }))}
              placeholder={t('selectListing')}
              searchPlaceholder={t('searchPlaceholder')}
              fullWidth
            />
          </div>
        </div>

        <div className='min-h-[260px]'>
          {isDetailLoading ? (
            <div className='flex items-center justify-center h-[260px]'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          ) : trend ? (
            <div className='space-y-6'>
              <Card id='saved-listing-trend-chart'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-base'>
                    {t('savesOverTime')}
                  </CardTitle>
                  <CardDescription>
                    {trend.listingTitle} · {t('totalSaves')}: {trend.totalSaves}
                  </CardDescription>
                  <div className='mt-2'>
                    <Select
                      value={period}
                      onValueChange={(v) =>
                        onPeriodChange?.(
                          v as '7d' | '30d' | '90d' | '180d' | '365d' | 'all',
                        )
                      }
                    >
                      <SelectTrigger className='w-[200px]'>
                        <SelectValue placeholder={t('period')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='7d'>{t('period7d')}</SelectItem>
                        <SelectItem value='30d'>{t('period30d')}</SelectItem>
                        <SelectItem value='90d'>{t('period90d')}</SelectItem>
                        <SelectItem value='180d'>{t('period180d')}</SelectItem>
                        <SelectItem value='365d'>{t('period365d')}</SelectItem>
                        <SelectItem value='all'>{t('periodAll')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <Input
                  className='w-[260px]'
                  placeholder={t('searchPlaceholder')}
                  value={searchKeyword || ''}
                  onChange={(e) => onSearchKeywordChange?.(e.target.value)}
                />
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>
                  {t('rowsPerPage')}
                </span>
                <Select
                  value={String(pageSize || 10)}
                  onValueChange={(v) => onPageSizeChange?.(Number(v))}
                >
                  <SelectTrigger className='w-[100px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='5'>5</SelectItem>
                    <SelectItem value='10'>10</SelectItem>
                    <SelectItem value='20'>20</SelectItem>
                    <SelectItem value='50'>50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                {isSummaryLoading ? (
                  <>
                    {Array.from({
                      length: Math.max(3, Math.min(10, pageSize || 10)),
                    }).map((_, idx) => (
                      <TableRow key={`sk-${idx}`}>
                        <TableCell>
                          <Skeleton className='h-4 w-[70%]' />
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end'>
                            <Skeleton className='h-4 w-12' />
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end'>
                            <Skeleton className='h-6 w-24 rounded-md' />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : listings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <div className='flex items-center justify-center h-[120px] text-muted-foreground'>
                        {t('noListings')}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  listings.map((listing) => (
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
                  ))
                )}
              </TableBody>
            </Table>
            <div className='flex items-center justify-between mt-4'>
              <div className='text-sm text-muted-foreground'>
                {typeof totalElements === 'number' &&
                typeof currentPage === 'number' &&
                typeof pageSize === 'number'
                  ? t('paginationInfo', {
                      from: currentPage * pageSize + 1,
                      to: Math.min((currentPage + 1) * pageSize, totalElements),
                      total: totalElements,
                    })
                  : null}
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={
                    isSummaryLoading || !onPageChange || (currentPage ?? 0) <= 0
                  }
                  onClick={() => onPageChange?.((currentPage ?? 0) - 1)}
                >
                  {t('prev')}
                </Button>
                <span className='text-sm'>
                  {typeof currentPage === 'number' &&
                  typeof totalPages === 'number'
                    ? `${currentPage + 1} / ${totalPages}`
                    : ''}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={
                    isSummaryLoading ||
                    !onPageChange ||
                    typeof currentPage !== 'number' ||
                    typeof totalPages !== 'number' ||
                    currentPage + 1 >= totalPages
                  }
                  onClick={() => onPageChange?.((currentPage ?? 0) + 1)}
                >
                  {t('next')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

export default DashboardSavedListingsChart
