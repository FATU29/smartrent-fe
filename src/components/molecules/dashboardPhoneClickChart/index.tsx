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
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Loader2 } from 'lucide-react'
import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns'
import { useIsMobile } from '@/hooks/useMediaQuery'
import type {
  OwnerListingAnalytics,
  OwnerListingAnalyticsSummaryItem,
} from '@/api/types'
import { PhoneClickDetailService } from '@/api/services'
import { Skeleton } from '@/components/atoms/skeleton'

interface DashboardPhoneClickChartProps {
  listings: OwnerListingAnalyticsSummaryItem[]
  selectedListingId?: number | null
  analytics?: OwnerListingAnalytics | null
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
  // period filter
  period?: '7d' | '30d' | '90d' | '180d' | '365d' | 'all'
  onPeriodChange?: (p: '7d' | '30d' | '90d' | '180d' | '365d' | 'all') => void
}

const DashboardPhoneClickChart: React.FC<DashboardPhoneClickChartProps> = ({
  listings,
  selectedListingId,
  analytics,
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
  const t = useTranslations('seller.dashboard.phoneClicks')
  const isMobile = useIsMobile() ?? false
  // Independent dropdown paging state (decoupled from table)
  const [selectKeyword, setSelectKeyword] = React.useState('')
  const [selectPage, setSelectPage] = React.useState(0)
  const [selectPageSize] = React.useState(20)
  const [selectHasMore, setSelectHasMore] = React.useState(true)
  const [selectLoading, setSelectLoading] = React.useState(false)
  const [selectLoadingMore, setSelectLoadingMore] = React.useState(false)
  const [selectOptions, setSelectOptions] = React.useState<
    OwnerListingAnalyticsSummaryItem[]
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
          ? await PhoneClickDetailService.searchOwnerListingsAnalytics({
              keyword: selectKeyword.trim(),
              page,
              size: selectPageSize,
            })
          : await PhoneClickDetailService.getOwnerListingsAnalyticsPage(
              page,
              selectPageSize,
            )
        if (resp.code !== '999999' || !resp.data) {
          throw new Error(resp.message || 'Failed to load options')
        }
        const nextListings = Array.from(resp.data.listings || [])
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
          const target = document.getElementById('phone-click-analytics-title')
          target?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
          })
        })
      })
    }
  }

  const clicksOverTimeData = useMemo(() => {
    if (!analytics?.clicksOverTime) {
      return []
    }
    const raw = analytics.clicksOverTime
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
      return raw
        .map((item) => ({
          date: format(parseISO(item.date), 'dd/MM'),
          count: item.count,
        }))
        .sort((a, b) => {
          const [ad, am] = a.date.split('/').map(Number)
          const [bd, bm] = b.date.split('/').map(Number)
          return (
            new Date(2000, am - 1, ad).getTime() -
            new Date(2000, bm - 1, bd).getTime()
          )
        })
    }

    const today = new Date()
    const start = subDays(today, days - 1)
    const map = new Map<string, number>()
    for (const item of raw) {
      map.set(item.date, item.count)
    }
    return eachDayOfInterval({ start, end: today }).map((d) => {
      const key = format(d, 'yyyy-MM-dd')
      return {
        date: format(d, 'dd/MM'),
        count: map.get(key) ?? 0,
      }
    })
  }, [analytics?.clicksOverTime, period])

  const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  const clicksByDayData = useMemo(() => {
    if (!analytics?.clicksByDayOfWeek) return []

    return dayOrder.map((day) => ({
      day,
      label: t(`days.${day}`),
      count: analytics.clicksByDayOfWeek[day] || 0,
    }))
  }, [analytics?.clicksByDayOfWeek, t])

  const chartConfig: ChartConfig = {
    count: {
      label: t('clicks'),
      color: 'var(--chart-1)',
    },
    weekdayCount: {
      label: t('clicks'),
      color: 'var(--chart-2)',
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('analyticsOverview')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
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

        {isDetailLoading ? (
          <div className='flex items-center justify-center h-[260px]'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : analytics ? (
          <>
            <div className='space-y-6'>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-base'>
                    {t('clicksOverTime')}
                  </CardTitle>
                  <div className='mt-2'>
                    <Select
                      value={period}
                      onValueChange={(v) =>
                        onPeriodChange?.(
                          v as '7d' | '30d' | '90d' | '180d' | '365d' | 'all',
                        )
                      }
                    >
                      <SelectTrigger className='w-full sm:w-[200px]'>
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
                    className={
                      isMobile ? 'h-[220px] w-full' : 'h-[260px] w-full'
                    }
                  >
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart data={clicksOverTimeData}>
                        <CartesianGrid strokeDasharray='3 3' vertical={false} />
                        <XAxis
                          dataKey='date'
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          minTickGap={isMobile ? 24 : 12}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
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
                        <Line
                          type='monotone'
                          dataKey='count'
                          stroke='var(--color-count)'
                          strokeWidth={3}
                          connectNulls
                          dot={{
                            r: 4,
                            fill: 'var(--color-count)',
                            stroke: 'hsl(var(--background))',
                            strokeWidth: 1.5,
                          }}
                          activeDot={{
                            r: 6,
                            fill: 'var(--color-count)',
                            stroke: 'hsl(var(--background))',
                            strokeWidth: 1.5,
                          }}
                          name={t('clicks')}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-base'>
                    {t('clicksByDayOfWeek')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    className={
                      isMobile ? 'h-[220px] w-full' : 'h-[260px] w-full'
                    }
                  >
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={clicksByDayData}>
                        <CartesianGrid strokeDasharray='3 3' vertical={false} />
                        <XAxis
                          dataKey='label'
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
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
                          dataKey='count'
                          fill='var(--color-weekdayCount)'
                          radius={[6, 6, 0, 0]}
                          name={t('clicks')}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base'>{t('allListings')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3'>
                  <div className='flex items-center gap-2 w-full md:w-auto'>
                    <Input
                      className='w-full md:w-[260px]'
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
                {isMobile ? (
                  <div className='space-y-2'>
                    {isSummaryLoading ? (
                      Array.from({
                        length: Math.max(3, Math.min(10, pageSize || 10)),
                      }).map((_, idx) => (
                        <div
                          key={`m-sk-${idx}`}
                          className='rounded-lg border p-3 space-y-2'
                        >
                          <Skeleton className='h-4 w-[70%]' />
                          <div className='flex items-center justify-between'>
                            <Skeleton className='h-4 w-12' />
                            <Skeleton className='h-8 w-24 rounded-md' />
                          </div>
                        </div>
                      ))
                    ) : listings.length === 0 ? (
                      <div className='flex items-center justify-center h-[120px] text-muted-foreground rounded-lg border'>
                        {t('noListings')}
                      </div>
                    ) : (
                      listings.map((listing) => (
                        <div
                          key={listing.listingId}
                          className='rounded-lg border p-3 space-y-2'
                        >
                          <p className='font-medium text-sm line-clamp-2'>
                            {listing.listingTitle}
                          </p>
                          <div className='flex items-center justify-between gap-3'>
                            <p className='text-sm text-muted-foreground'>
                              {t('totalClicks')}:{' '}
                              <strong>{listing.totalClicks}</strong>
                            </p>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                handleSelectListing(listing.listingId)
                              }
                            >
                              {t('viewDetails')}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('listing')}</TableHead>
                        <TableHead className='text-right'>
                          {t('totalClicks')}
                        </TableHead>
                        <TableHead className='text-right'>
                          {t('action')}
                        </TableHead>
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
                              {listing.totalClicks}
                            </TableCell>
                            <TableCell className='text-right'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  handleSelectListing(listing.listingId)
                                }
                              >
                                {t('viewDetails')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
                <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-4'>
                  <div className='text-sm text-muted-foreground'>
                    {typeof totalElements === 'number' &&
                    typeof currentPage === 'number' &&
                    typeof pageSize === 'number'
                      ? t('paginationInfo', {
                          from: currentPage * pageSize + 1,
                          to: Math.min(
                            (currentPage + 1) * pageSize,
                            totalElements,
                          ),
                          total: totalElements,
                        })
                      : null}
                  </div>
                  <div className='flex items-center justify-between sm:justify-end gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={
                        isSummaryLoading ||
                        !onPageChange ||
                        (currentPage ?? 0) <= 0
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
          </>
        ) : (
          <div className='flex items-center justify-center h-[260px] text-muted-foreground'>
            {t('noData')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DashboardPhoneClickChart
