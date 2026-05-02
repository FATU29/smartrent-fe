'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useUsersForMyListings } from '@/hooks/usePhoneClickDetails'
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
} from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { PageContainer } from '@/components/atoms/pageContainer'
import { Typography } from '@/components/atoms/typography'
import UnifiedDetailDialog from '@/components/molecules/customerManagement/UnifiedDetailDialog'
import StatsCarousel from '@/components/molecules/customerManagement/StatsCarousel'
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
  const [selectedCustomer, setSelectedCustomer] =
    useState<UserPhoneClickDetail | null>(null)
  const [selectedListing, setSelectedListing] =
    useState<ListingClickInfo | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [initialView, setInitialView] = useState<ViewType>('customer')
  const pageSize = 10

  // Fetch data
  const { data, isLoading, error, refetch } = useUsersForMyListings(
    page,
    pageSize,
  )

  // Filter data by search query
  const filteredData = useMemo(() => {
    if (!data?.data) return []
    if (!searchQuery.trim()) return data.data

    const query = searchQuery.toLowerCase()
    return data.data.filter(
      (customer: UserPhoneClickDetail) =>
        customer.firstName?.toLowerCase().includes(query) ||
        customer.lastName?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.contactPhone?.includes(query),
    )
  }, [data?.data, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    if (!data?.data)
      return { totalCustomers: 0, totalClicks: 0, uniqueUsers: 0 }

    return {
      totalCustomers: data.totalElements || 0,
      totalClicks: data.data.reduce(
        (sum: number, customer: UserPhoneClickDetail) => {
          return (
            sum +
            customer.clickedListings.reduce(
              (s: number, listing: ListingClickInfo) => s + listing.clickCount,
              0,
            )
          )
        },
        0,
      ),
      uniqueUsers: data.data.length || 0,
    }
  }, [data])

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

  // Render loading state
  if (isLoading) {
    return (
      <PageContainer width='grid' className='py-8'>
        <div className='flex items-center justify-center py-24'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <span className='ml-3 text-lg'>{t('loading')}</span>
        </div>
      </PageContainer>
    )
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

  // Render empty state
  if (!data?.data || data.data.length === 0) {
    return (
      <PageContainer width='grid' className='py-8'>
        <div className='mb-8'>
          <Typography variant='pageTitle'>{t('title')}</Typography>
          <p className='text-muted-foreground mt-2'>{t('subtitle')}</p>
        </div>

        <div className='relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-primary/5 px-6 py-16 text-center'>
          {/* Soft radial accent at the top to draw the eye to the icon */}
          <div
            className='pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.18),transparent_70%)]'
            aria-hidden='true'
          />

          {/* Solid primary icon — focal point */}
          <div className='relative mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25'>
            <Users className='size-8' aria-hidden='true' />
          </div>

          <Typography
            variant='h4'
            as='h3'
            className='relative mb-2 text-foreground'
          >
            {t('emptyState.customers.title')}
          </Typography>
          <p className='relative max-w-md text-sm text-muted-foreground'>
            {t('emptyState.customers.description')}
          </p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer width='grid' className='pt-8 pb-20 space-y-6'>
      {/* Header */}
      <div>
        <Typography variant='pageTitle'>{t('title')}</Typography>
        <p className='text-muted-foreground mt-2'>{t('subtitle')}</p>
      </div>

      {/* Stats Cards - Desktop Grid */}
      <div className='hidden md:grid gap-4 md:grid-cols-3'>
        <Card className='p-6 hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-primary/10 to-background border-primary/20'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm font-medium text-muted-foreground'>
              {t('stats.totalCustomers')}
            </p>
            <Users className='h-6 w-6 text-primary' />
          </div>
          <p className='text-3xl font-bold text-primary'>
            {stats.totalCustomers}
          </p>
        </Card>

        <Card className='p-6 hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-primary/10 to-background border-primary/20'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm font-medium text-muted-foreground'>
              {t('stats.totalClicks')}
            </p>
            <MousePointerClick className='h-6 w-6 text-primary' />
          </div>
          <p className='text-3xl font-bold text-primary'>{stats.totalClicks}</p>
        </Card>

        <Card className='p-6 hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-primary/10 to-background border-primary/20'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm font-medium text-muted-foreground'>
              {t('stats.uniqueUsers')}
            </p>
            <TrendingUp className='h-6 w-6 text-primary' />
          </div>
          <p className='text-3xl font-bold text-primary'>{stats.uniqueUsers}</p>
        </Card>
      </div>

      {/* Stats Carousel - Mobile Only */}
      <div className='md:hidden'>
        <StatsCarousel
          stats={[
            {
              icon: <Users className='h-6 w-6 text-primary' />,
              value: stats.totalCustomers,
              label: t('stats.totalCustomers'),
              gradient:
                'bg-gradient-to-br from-primary/10 to-background border-primary/20',
            },
            {
              icon: <MousePointerClick className='h-6 w-6 text-primary' />,
              value: stats.totalClicks,
              label: t('stats.totalClicks'),
              gradient:
                'bg-gradient-to-br from-primary/10 to-background border-primary/20',
            },
            {
              icon: <TrendingUp className='h-6 w-6 text-primary' />,
              value: stats.uniqueUsers,
              label: t('stats.uniqueUsers'),
              gradient:
                'bg-gradient-to-br from-primary/10 to-background border-primary/20',
            },
          ]}
        />
      </div>

      {/* Search */}
      <Card className='p-4 shadow-sm hover:shadow-md transition-shadow duration-200'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
          <input
            type='text'
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
          />
        </div>
      </Card>

      {/* Customer Table */}
      <Card className='overflow-hidden'>
        <div className='p-6 border-b'>
          <Typography variant='h5' as='h3'>
            {t('table.customer')}
          </Typography>
          <p className='text-sm text-muted-foreground mt-1'>
            {t('pagination.showing')} {filteredData.length}{' '}
            {t('pagination.results')}
          </p>
        </div>

        {filteredData.length === 0 ? (
          <div className='text-center py-12'>
            <Typography variant='h5' as='h3' className='mb-2'>
              {t('emptyState.search.title')}
            </Typography>
            <p className='text-muted-foreground'>
              {t('emptyState.search.description')}
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-muted/50'>
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
                  <th className='px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    {t('table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className='bg-background divide-y divide-border'>
                {filteredData.map((customer: UserPhoneClickDetail) => {
                  const totalClicks = customer.clickedListings.reduce(
                    (sum, l) => sum + l.clickCount,
                    0,
                  )

                  return (
                    <tr
                      key={customer.userId}
                      className='hover:bg-primary/5 transition-colors duration-150 cursor-pointer group'
                      onClick={() => openCustomerDetail(customer)}
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center gap-3'>
                          <Avatar className='group-hover:ring-2 group-hover:ring-primary transition-all duration-200'>
                            {customer.avatarUrl && (
                              <AvatarImage
                                src={customer.avatarUrl}
                                alt={`${customer.firstName} ${customer.lastName}`}
                              />
                            )}
                            <AvatarFallback>
                              {getInitials(
                                customer.firstName,
                                customer.lastName,
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='font-medium text-foreground group-hover:text-primary transition-colors'>
                              {customer.firstName} {customer.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <Mail className='h-4 w-4 text-muted-foreground' />
                          <span className='text-sm text-foreground'>
                            {customer.email}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <Phone className='h-4 w-4 text-muted-foreground' />
                          <span className='text-sm text-foreground'>
                            {customer.contactPhone || 'N/A'}
                          </span>
                          {customer.contactPhoneVerified ? (
                            <CheckCircle2 className='h-4 w-4 text-primary' />
                          ) : (
                            <XCircle className='h-4 w-4 text-muted-foreground' />
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <Badge variant='secondary' className='font-semibold'>
                          {totalClicks}
                        </Badge>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='space-y-2 max-w-xs'>
                          {customer.clickedListings
                            .slice(0, 2)
                            .map((listing) => {
                              const handleListingKeyDown = (
                                e: React.KeyboardEvent,
                              ) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setSelectedListing(listing)
                                  setInitialView('listing')
                                  setDialogOpen(true)
                                }
                              }

                              return (
                                <div
                                  key={listing.listingId}
                                  role='button'
                                  tabIndex={0}
                                  className='text-sm p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer border border-transparent hover:border-primary/20'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedListing(listing)
                                    setInitialView('listing')
                                    setDialogOpen(true)
                                  }}
                                  onKeyDown={handleListingKeyDown}
                                  aria-label={`View listing: ${listing.listingTitle}`}
                                >
                                  <div className='font-medium truncate text-foreground hover:text-primary transition-colors'>
                                    {listing.listingTitle}
                                  </div>
                                  <div className='text-xs text-muted-foreground flex items-center gap-2'>
                                    <span>{formatDate(listing.clickedAt)}</span>
                                    <span>·</span>
                                    <Badge
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      {listing.clickCount}{' '}
                                      {t('listingCard.clicks')}
                                    </Badge>
                                  </div>
                                </div>
                              )
                            })}
                          {customer.clickedListings.length > 2 && (
                            <div className='text-xs text-primary font-medium hover:text-primary/80 cursor-pointer'>
                              +{customer.clickedListings.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <div className='flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                          {customer.contactPhone && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopyToClipboard(
                                  customer.contactPhone,
                                  'phone',
                                )
                              }}
                              className='p-2 hover:bg-primary/10 rounded-lg transition-colors'
                              title={t('table.copyPhone')}
                            >
                              <Copy className='h-4 w-4 text-primary' />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyToClipboard(customer.email, 'email')
                            }}
                            className='p-2 hover:bg-primary/10 rounded-lg transition-colors'
                            title={t('table.copyEmail')}
                          >
                            <Mail className='h-4 w-4 text-primary' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
              className='hover:bg-primary/5 hover:border-primary/30 transition-colors'
            >
              <ChevronLeft className='h-4 w-4 mr-1' />
              {t('pagination.previous')}
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className='hover:bg-primary/5 hover:border-primary/30 transition-colors'
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
