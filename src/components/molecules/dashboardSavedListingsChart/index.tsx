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
import { Loader2, Heart, ListX, Search } from 'lucide-react'
import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns'
import { useIsMobile } from '@/hooks/useMediaQuery'
import type {
  ListingSaveSummary,
  OwnerListingSavesTrendResponse,
} from '@/api/types'
import DashboardNoDataState from '@/components/molecules/dashboardNoDataState'

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
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--primary)',
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
  const isMobile = useIsMobile() ?? false
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

  const hasSavesOverTimeData = savesOverTimeData.some((item) => item.count > 0)
  const hasListingBarData = barChartData.some((item) => item.totalSaves > 0)
  const hasSavedMetrics =
    totalSavesAcrossAll > 0 || (trend?.totalSaves || 0) > 0
  const hasSavedListingsData =
    hasSavedMetrics || hasSavesOverTimeData || hasListingBarData
  const showEmptyState =
    !isSummaryLoading && !isDetailLoading && !hasSavedListingsData

  return (
    <Card className='border-border/70 bg-card/80 shadow-sm'>
      <CardHeader className='space-y-2 pb-4'>
        <CardTitle className='text-lg font-semibold tracking-tight'>
          {t('overview')}
        </CardTitle>
        <CardDescription className='max-w-3xl text-sm leading-relaxed'>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-7'>
        {showEmptyState ? (
          <DashboardNoDataState
            title={t('emptyState.title')}
            description={t('emptyState.description')}
            badgeLabel={t('noData')}
            hintTitle={t('emptyState.hintTitle')}
            hints={[
              t('emptyState.tip1'),
              t('emptyState.tip2'),
              t('emptyState.tip3'),
            ]}
            metricChips={[
              t('savesOverTime'),
              t('savesByListing'),
              t('allListings'),
            ]}
          />
        ) : (
          <>
            <div className='rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-50/70 via-amber-50/30 to-background p-4 shadow-sm dark:border-amber-900/50 dark:from-amber-950/25 dark:via-amber-950/10 dark:to-background sm:p-5'>
              <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300'>
                <Heart className='h-4 w-4 text-amber-500' />
                {t('totalSavesAcrossAll')}
              </div>
              <p className='mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
                {totalSavesAcrossAll}
              </p>
            </div>

            <div className='space-y-2.5'>
              <p className='text-sm font-semibold tracking-tight'>
                {t('listing')}
              </p>
              <div className='w-full md:w-[420px]'>
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
              {isDetailLoading || (isSummaryLoading && !trend) ? (
                <div className='flex items-center justify-center h-[260px]'>
                  <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                </div>
              ) : trend ? (
                <div className='space-y-8'>
                  <section
                    id='saved-listing-trend-chart'
                    className='space-y-4 border-t border-border/60 pt-6'
                  >
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                      <div className='space-y-1'>
                        <h3 className='text-base font-semibold tracking-tight'>
                          {t('savesOverTime')}
                        </h3>
                        <p className='text-sm text-muted-foreground'>
                          {trend.listingTitle} · {t('totalSaves')}:{' '}
                          {trend.totalSaves}
                        </p>
                      </div>
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
                          <SelectItem value='180d'>
                            {t('period180d')}
                          </SelectItem>
                          <SelectItem value='365d'>
                            {t('period365d')}
                          </SelectItem>
                          <SelectItem value='all'>{t('periodAll')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <ChartContainer
                        config={chartConfig}
                        className={
                          isMobile ? 'h-[220px] w-full' : 'h-[260px] w-full'
                        }
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
                            <CartesianGrid
                              strokeDasharray='3 3'
                              vertical={false}
                            />
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
                              allowDecimals={false}
                            />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (
                                  !active ||
                                  !payload ||
                                  payload.length === 0
                                ) {
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
                                    labelFormatter={() =>
                                      `${t('date')}: ${label}`
                                    }
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
                    </div>
                  </section>

                  <section className='space-y-4 border-t border-border/60 pt-6'>
                    <h3 className='text-base font-semibold tracking-tight'>
                      {t('savesByListing')}
                    </h3>
                    <div>
                      <ChartContainer
                        config={chartConfig}
                        className={
                          isMobile ? 'h-[220px] w-full' : 'h-[260px] w-full'
                        }
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
                              width={isMobile ? 120 : 180}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (
                                  !active ||
                                  !payload ||
                                  payload.length === 0
                                ) {
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
                    </div>
                  </section>
                </div>
              ) : (
                <div className='flex h-[260px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/20 text-center text-muted-foreground'>
                  <ListX className='size-5 text-muted-foreground' />
                  <p className='text-sm font-medium'>{t('noListings')}</p>
                </div>
              )}
            </div>

            <section className='space-y-4 border-t border-border/60 pt-6'>
              <h3 className='text-base font-semibold tracking-tight'>
                {t('allListings')}
              </h3>
              <div>
                <div className='mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                  <div className='relative w-full md:w-auto'>
                    <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                    <Input
                      className='w-full pl-9 md:w-[280px]'
                      placeholder={t('searchPlaceholder')}
                      value={searchKeyword || ''}
                      onChange={(e) => onSearchKeywordChange?.(e.target.value)}
                    />
                  </div>
                  <div className='flex items-center justify-between gap-2 sm:justify-start'>
                    <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
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
                  <div className='space-y-2.5'>
                    {isSummaryLoading ? (
                      Array.from({
                        length: Math.max(3, Math.min(10, pageSize || 10)),
                      }).map((_, idx) => (
                        <div
                          key={`m-sk-${idx}`}
                          className='space-y-2.5 rounded-xl border border-border/70 bg-background/75 p-3.5'
                        >
                          <Skeleton className='h-4 w-[70%]' />
                          <div className='flex items-center justify-between'>
                            <Skeleton className='h-4 w-12' />
                            <Skeleton className='h-8 w-24 rounded-md' />
                          </div>
                        </div>
                      ))
                    ) : listings.length === 0 ? (
                      <div className='flex h-[150px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-center'>
                        <ListX className='size-5 text-muted-foreground' />
                        <p className='text-sm font-medium text-muted-foreground'>
                          {t('noListings')}
                        </p>
                      </div>
                    ) : (
                      listings.map((listing) => (
                        <div
                          key={listing.listingId}
                          className='space-y-2.5 rounded-xl border border-border/70 bg-background/75 p-3.5'
                        >
                          <p className='line-clamp-2 text-sm font-medium leading-5'>
                            {listing.listingTitle}
                          </p>
                          <div className='flex items-center justify-between gap-3'>
                            <p className='text-sm text-muted-foreground'>
                              {t('totalSaves')}:{' '}
                              <strong className='text-foreground'>
                                {listing.totalSaves}
                              </strong>
                            </p>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                handleSelectListing(listing.listingId)
                              }
                            >
                              {t('viewTrend')}
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
                        <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                          {t('listing')}
                        </TableHead>
                        <TableHead className='text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                          {t('totalSaves')}
                        </TableHead>
                        <TableHead className='text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
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
                            <div className='mx-auto flex h-[150px] w-full max-w-md flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/20 text-center'>
                              <ListX className='size-5 text-muted-foreground' />
                              <p className='text-sm font-medium text-muted-foreground'>
                                {t('noListings')}
                              </p>
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
                                onClick={() =>
                                  handleSelectListing(listing.listingId)
                                }
                              >
                                {t('viewTrend')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
                <div className='mt-4 flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='text-xs text-muted-foreground sm:text-sm'>
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
                  <div className='flex items-center justify-between gap-2 sm:justify-end'>
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
                    <span className='min-w-16 text-center text-sm font-medium'>
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
              </div>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default DashboardSavedListingsChart
