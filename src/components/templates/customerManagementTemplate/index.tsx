'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  useUsersForMyListings,
  useOwnerPhoneClickStats,
} from '@/hooks/usePhoneClickDetails'
import {
  Search,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  Users,
  MousePointerClick,
  TrendingUp,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Card } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { PageContainer } from '@/components/atoms/pageContainer'
import { Typography } from '@/components/atoms/typography'
import UnifiedDetailDialog from '@/components/molecules/customerManagement/UnifiedDetailDialog'
import StatsCarousel from '@/components/molecules/customerManagement/StatsCarousel'
import CustomerManagementSkeleton, {
  CustomerRowsSkeleton,
} from '@/components/molecules/customerManagement/customerManagementSkeleton'
import {
  copyToClipboard,
  getInitials,
  formatDate,
} from '@/components/molecules/customerManagement/utils'
import type {
  UserPhoneClickDetail,
  ListingClickInfo,
} from '@/api/types/phone-click-detail.type'

type ViewType = 'customer' | 'listing'

const CustomerManagementTemplate = () => {
  const t = useTranslations('seller.customers')
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] =
    useState<UserPhoneClickDetail | null>(null)
  const [selectedListing, setSelectedListing] =
    useState<ListingClickInfo | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [initialView, setInitialView] = useState<ViewType>('customer')
  const pageSize = 10

  // Search runs only when explicitly submitted (button / Enter) — no debounce
  const hasSearch = submittedSearch.trim().length > 0

  const runSearch = () => {
    const next = searchQuery.trim()
    setSubmittedSearch(next)
    setPage(1)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSubmittedSearch('')
    setPage(1)
  }

  // Fetch data — search is performed server-side via the keyword param
  const { data, isLoading, isFetching, error, refetch } = useUsersForMyListings(
    page,
    pageSize,
    submittedSearch,
  )

  // Aggregate stats across ALL of the owner's listings — fetched separately
  // from the paginated customer list so the numbers don't shrink/change as
  // the seller pages through results.
  const { data: ownerStats } = useOwnerPhoneClickStats()

  // The API already returns the (optionally filtered) page of customers
  const customers = data?.data ?? []

  // Calculate stats
  const stats = useMemo(
    () => ({
      totalCustomers: data?.totalElements || 0,
      totalClicks: ownerStats?.totalClicks || 0,
      uniqueUsers: ownerStats?.uniqueUsers || 0,
    }),
    [data, ownerStats],
  )

  const handleCopyToClipboard = (text: string, type: 'phone' | 'email') => {
    copyToClipboard(text, type, {
      phone: t('copiedPhone'),
      email: t('copiedEmail'),
    })
  }

  const openCustomerDetail = (customer: UserPhoneClickDetail) => {
    setSelectedCustomer(customer)
    setSelectedListing(null)
    setInitialView('customer')
    setDialogOpen(true)
  }

  const handleSwitchToCustomer = (customer: UserPhoneClickDetail) => {
    setSelectedCustomer(customer)
    setSelectedListing(null)
  }

  const handleSwitchToListing = (listing: ListingClickInfo) => {
    setSelectedCustomer(null)
    setSelectedListing(listing)
  }

  // Render loading state with a layout-matching skeleton
  if (isLoading) {
    return <CustomerManagementSkeleton />
  }

  // Render error state
  if (error) {
    return (
      <PageContainer width='grid' className='py-8'>
        <div className='rounded-lg border border-destructive/30 bg-destructive/10 p-6'>
          <Typography variant='h5' as='h3' className='text-destructive mb-2'>
            {t('error')}
          </Typography>
          <p className='text-destructive mb-4'>{error.message}</p>
          <Button onClick={() => refetch()} variant='outline'>
            {t('retry')}
          </Button>
        </div>
      </PageContainer>
    )
  }

  // Render empty state (only when there is genuinely no customer data, not an
  // empty search result — that is handled inline below so the search box stays)
  if (!hasSearch && (!data?.data || data.data.length === 0)) {
    return (
      <PageContainer width='grid' className='py-8'>
        <div className='mb-8'>
          <Typography variant='pageTitle'>{t('title')}</Typography>
          <p className='text-muted-foreground mt-2 text-sm'>{t('subtitle')}</p>
        </div>

        <div className='flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-16 text-center'>
          <div className='mb-5 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground'>
            <Users className='size-7' aria-hidden='true' />
          </div>

          <Typography variant='h5' as='h3' className='mb-2 text-foreground'>
            {t('emptyState.customers.title')}
          </Typography>
          <p className='max-w-md text-sm text-muted-foreground'>
            {t('emptyState.customers.description')}
          </p>
        </div>
      </PageContainer>
    )
  }

  const statCards = [
    {
      icon: Users,
      value: stats.totalCustomers,
      label: t('stats.totalCustomers'),
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      icon: MousePointerClick,
      value: stats.totalClicks,
      label: t('stats.totalClicks'),
      iconClass: 'bg-orange-500/10 text-orange-600',
    },
    {
      icon: TrendingUp,
      value: stats.uniqueUsers,
      label: t('stats.uniqueUsers'),
      iconClass: 'bg-green-500/10 text-green-600',
    },
  ]

  const openListingDetail = (listing: ListingClickInfo) => {
    setSelectedListing(listing)
    setInitialView('listing')
    setDialogOpen(true)
  }

  return (
    <PageContainer width='grid' className='pt-8 pb-20 space-y-6'>
      {/* Header */}
      <div>
        <Typography variant='pageTitle'>{t('title')}</Typography>
        <p className='text-muted-foreground mt-2 text-sm'>{t('subtitle')}</p>
      </div>

      {/* Stats Cards - Desktop Grid */}
      <div className='hidden md:grid gap-4 md:grid-cols-3'>
        {statCards.map(({ icon: Icon, value, label, iconClass }) => (
          <Card
            key={label}
            className='p-5 hover:border-border/80 transition-colors'
          >
            <div className='flex items-center gap-3 mb-3'>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
              >
                <Icon className='h-5 w-5' />
              </div>
              <p className='text-sm font-medium text-muted-foreground'>
                {label}
              </p>
            </div>
            {/* Stat-value emphasis (count), not a heading — outside type ramp. */}
            {/* eslint-disable-next-line design-system/no-inline-heading-sizes */}
            <p className='text-3xl font-semibold text-foreground tracking-tight'>
              {value}
            </p>
          </Card>
        ))}
      </div>

      {/* Stats Carousel - Mobile Only */}
      <div className='md:hidden'>
        <StatsCarousel
          stats={statCards.map(({ icon: Icon, value, label, iconClass }) => ({
            icon: <Icon className='h-5 w-5' />,
            value,
            label,
            iconClass,
          }))}
        />
      </div>

      {/* Search */}
      <div className='flex items-center gap-2 max-w-md'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary' />
          <Input
            type='text'
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch()
            }}
            className='pl-9 pr-9'
          />
          {searchQuery && (
            <button
              type='button'
              onClick={clearSearch}
              className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
              aria-label={t('clearSearch')}
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
        <Button onClick={runSearch} disabled={isFetching} className='gap-1.5'>
          {isFetching ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Search className='h-4 w-4' />
          )}
          {t('search')}
        </Button>
      </div>

      {/* Customer List Header */}
      <div className='flex items-baseline justify-between'>
        <Typography variant='h5' as='h3'>
          {t('table.customer')}
        </Typography>
        <p className='text-sm text-muted-foreground'>
          {t('pagination.showing')} {customers.length} {t('pagination.results')}
        </p>
      </div>

      {isFetching ? (
        <CustomerRowsSkeleton />
      ) : customers.length === 0 ? (
        <Card className='text-center py-12'>
          <Typography variant='h5' as='h3' className='mb-2'>
            {t('emptyState.search.title')}
          </Typography>
          <p className='text-sm text-muted-foreground'>
            {t('emptyState.search.description')}
          </p>
        </Card>
      ) : (
        <>
          {/* Customer Table - Desktop */}
          <Card className='hidden md:block overflow-hidden p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-muted/40 border-b border-border'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                      {t('table.customer')}
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                      {t('table.email')}
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                      {t('table.phone')}
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                      {t('table.totalClicks')}
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                      {t('table.clickedListings')}
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-card divide-y divide-border'>
                  {customers.map((customer: UserPhoneClickDetail) => {
                    const totalClicks = customer.clickedListings.reduce(
                      (sum, l) => sum + l.clickCount,
                      0,
                    )

                    return (
                      <tr
                        key={customer.userId}
                        className='hover:bg-muted/40 transition-colors duration-150 cursor-pointer group'
                        onClick={() => openCustomerDetail(customer)}
                      >
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex items-center gap-3'>
                            <Avatar>
                              {customer.avatarUrl && (
                                <AvatarImage
                                  src={customer.avatarUrl}
                                  alt={`${customer.firstName} ${customer.lastName}`}
                                />
                              )}
                              <AvatarFallback className='bg-muted text-muted-foreground text-xs font-medium'>
                                {getInitials(
                                  customer.firstName,
                                  customer.lastName,
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className='font-medium text-sm text-foreground'>
                              {customer.firstName} {customer.lastName}
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2'>
                            <Mail className='h-4 w-4 text-primary' />
                            <span className='text-sm text-foreground'>
                              {customer.email}
                            </span>
                            {customer.email && (
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyToClipboard(customer.email, 'email')
                                }}
                                className='p-1 rounded-md text-muted-foreground opacity-0 transition-all hover:bg-primary/10 hover:text-primary group-hover:opacity-100'
                                title={t('table.copyEmail')}
                                aria-label={t('table.copyEmail')}
                              >
                                <Copy className='h-3.5 w-3.5' />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2'>
                            <Phone className='h-4 w-4 text-green-600' />
                            <span className='text-sm text-foreground'>
                              {customer.contactPhone || 'N/A'}
                            </span>
                            {customer.contactPhoneVerified ? (
                              <CheckCircle2 className='h-4 w-4 text-green-600' />
                            ) : (
                              <XCircle className='h-4 w-4 text-muted-foreground/50' />
                            )}
                            {customer.contactPhone && (
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyToClipboard(
                                    customer.contactPhone,
                                    'phone',
                                  )
                                }}
                                className='p-1 rounded-md text-muted-foreground opacity-0 transition-all hover:bg-primary/10 hover:text-primary group-hover:opacity-100'
                                title={t('table.copyPhone')}
                                aria-label={t('table.copyPhone')}
                              >
                                <Copy className='h-3.5 w-3.5' />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4 text-center'>
                          <Badge
                            variant='secondary'
                            className='font-medium tabular-nums'
                          >
                            {totalClicks}
                          </Badge>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='space-y-1.5 max-w-xs'>
                            {customer.clickedListings
                              .slice(0, 2)
                              .map((listing) => {
                                const handleListingKeyDown = (
                                  e: React.KeyboardEvent,
                                ) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    openListingDetail(listing)
                                  }
                                }

                                return (
                                  <div
                                    key={listing.listingId}
                                    role='button'
                                    tabIndex={0}
                                    className='text-sm p-2 rounded-md hover:bg-muted transition-colors cursor-pointer'
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openListingDetail(listing)
                                    }}
                                    onKeyDown={handleListingKeyDown}
                                    aria-label={`View listing: ${listing.listingTitle}`}
                                  >
                                    <div className='font-medium truncate text-foreground text-sm'>
                                      {listing.listingTitle}
                                    </div>
                                    <div className='text-xs text-muted-foreground flex items-center gap-2 mt-0.5'>
                                      <span>
                                        {formatDate(listing.clickedAt)}
                                      </span>
                                      <span>·</span>
                                      <span>
                                        {listing.clickCount}{' '}
                                        {t('listingCard.clicks')}
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                            {customer.clickedListings.length > 2 && (
                              <div className='text-xs text-muted-foreground font-medium pl-2'>
                                +{customer.clickedListings.length - 2} more
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Customer List - Mobile Cards */}
          <div className='md:hidden space-y-3'>
            {customers.map((customer: UserPhoneClickDetail) => {
              const totalClicks = customer.clickedListings.reduce(
                (sum, l) => sum + l.clickCount,
                0,
              )
              const handleCardKeyDown = (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openCustomerDetail(customer)
                }
              }

              return (
                <Card
                  key={customer.userId}
                  role='button'
                  tabIndex={0}
                  onClick={() => openCustomerDetail(customer)}
                  onKeyDown={handleCardKeyDown}
                  className='p-4 cursor-pointer active:scale-[0.99] transition-transform'
                >
                  <div className='flex items-start gap-3'>
                    <Avatar className='h-11 w-11 flex-shrink-0'>
                      {customer.avatarUrl && (
                        <AvatarImage
                          src={customer.avatarUrl}
                          alt={`${customer.firstName} ${customer.lastName}`}
                        />
                      )}
                      <AvatarFallback className='bg-muted text-muted-foreground text-sm font-medium'>
                        {getInitials(customer.firstName, customer.lastName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2 mb-2'>
                        <div className='font-medium text-sm text-foreground truncate'>
                          {customer.firstName} {customer.lastName}
                        </div>
                        <Badge
                          variant='secondary'
                          className='font-medium tabular-nums flex-shrink-0'
                        >
                          {totalClicks}
                        </Badge>
                      </div>

                      <div className='space-y-1 text-xs text-muted-foreground'>
                        <div className='flex items-center gap-1.5 truncate'>
                          <Mail className='h-3.5 w-3.5 flex-shrink-0 text-primary' />
                          <span className='truncate'>{customer.email}</span>
                        </div>
                        {customer.contactPhone && (
                          <div className='flex items-center gap-1.5'>
                            <Phone className='h-3.5 w-3.5 flex-shrink-0 text-green-600' />
                            <span>{customer.contactPhone}</span>
                            {customer.contactPhoneVerified && (
                              <CheckCircle2 className='h-3.5 w-3.5 text-green-600' />
                            )}
                          </div>
                        )}
                      </div>

                      {customer.clickedListings.length > 0 && (
                        <div className='mt-3 pt-3 border-t border-border'>
                          <p className='text-xs font-medium text-foreground truncate'>
                            {customer.clickedListings[0].listingTitle}
                          </p>
                          <p className='text-xs text-muted-foreground mt-0.5'>
                            {formatDate(customer.clickedListings[0].clickedAt)}
                            {customer.clickedListings.length > 1 && (
                              <span>
                                {' · +'}
                                {customer.clickedListings.length - 1} more
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            {t('pagination.page')} {data.page} {t('pagination.of')}{' '}
            {data.totalPages}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className='h-4 w-4 mr-1' />
              {t('pagination.previous')}
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              {t('pagination.next')}
              <ChevronRight className='h-4 w-4 ml-1' />
            </Button>
          </div>
        </div>
      )}

      {/* Unified Dialog */}
      <UnifiedDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialView={initialView}
        customer={selectedCustomer}
        listing={selectedListing}
        onSwitchToCustomer={handleSwitchToCustomer}
        onSwitchToListing={handleSwitchToListing}
      />
    </PageContainer>
  )
}

export default CustomerManagementTemplate
