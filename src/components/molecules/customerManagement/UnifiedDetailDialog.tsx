'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  Mail,
  Phone,
  CheckCircle2,
  Copy,
  Calendar,
  TrendingUp,
  Eye,
  Users,
  MousePointerClick,
  Home,
  Loader2,
  ArrowLeft,
  ExternalLink,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { Badge } from '@/components/atoms/badge'
import { Card } from '@/components/atoms/card'
import { Dialog, DialogContent } from '@/components/atoms/dialog'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import {
  useUsersWhoClickedListing,
  usePhoneClickStats,
} from '@/hooks/usePhoneClickDetails'
import type {
  UserPhoneClickDetail,
  ListingClickInfo,
} from '@/api/types/phone-click-detail.type'
import { copyToClipboard, getInitials, formatDate } from './utils'
import { InterestedUserCard } from './InterestedUserCard'

type ViewType = 'customer' | 'listing'

interface UnifiedDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialView: ViewType
  customer: UserPhoneClickDetail | null
  listing: ListingClickInfo | null
  onSwitchToCustomer: (customer: UserPhoneClickDetail) => void
  onSwitchToListing: (listing: ListingClickInfo) => void
}

export default function UnifiedDetailDialog({
  open,
  onOpenChange,
  initialView,
  customer,
  listing,
  onSwitchToCustomer,
  onSwitchToListing,
}: UnifiedDetailDialogProps) {
  const t = useTranslations('seller.customers')
  const [currentView, setCurrentView] = useState<ViewType>(initialView)

  useEffect(() => {
    if (open) {
      setCurrentView(initialView)
    }
  }, [initialView, open])

  const { data: usersData, isLoading: loadingUsers } =
    useUsersWhoClickedListing(listing?.listingId || 0, 1, 10)
  const { data: stats, isLoading: loadingStats } = usePhoneClickStats(
    listing?.listingId || 0,
  )

  const handleCopyToClipboard = (text: string, type: 'phone' | 'email') => {
    copyToClipboard(text, type, {
      phone: t('copiedPhone'),
      email: t('copiedEmail'),
    })
  }

  const switchToCustomer = (user: UserPhoneClickDetail) => {
    onSwitchToCustomer(user)
    setCurrentView('customer')
  }

  const switchToListing = (listingItem: ListingClickInfo) => {
    onSwitchToListing(listingItem)
    setCurrentView('listing')
  }

  const isCustomerView = currentView === 'customer'
  const canGoBack = (isCustomerView && listing) || (!isCustomerView && customer)
  const displayName =
    isCustomerView && customer
      ? `${customer.firstName} ${customer.lastName}`
      : listing?.listingTitle || ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          // Remove default sizing and padding
          'h-fit-none w-fit-none p-0 gap-0',
          // Mobile: fullscreen
          'h-screen w-screen max-w-none rounded-none',
          // Desktop: large modal, keep centered positioning from default
          'sm:h-auto sm:w-full sm:max-w-4xl sm:max-h-[90vh] sm:rounded-lg',
          // Layout
          'flex flex-col overflow-hidden',
        )}
      >
        {/* Header */}
        <header className='relative bg-card border-b border-border flex-shrink-0'>
          <div className='px-4 py-4 sm:px-6 sm:py-5'>
            <div className='flex items-center gap-3 mb-4'>
              {/* Back button */}
              {canGoBack && (
                <button
                  onClick={() =>
                    setCurrentView(isCustomerView ? 'listing' : 'customer')
                  }
                  className='p-2 -ml-2 hover:bg-muted rounded-full transition-colors active:scale-95 text-muted-foreground'
                  aria-label='Go back'
                >
                  <ArrowLeft className='h-5 w-5' />
                </button>
              )}

              {/* Avatar/Icon */}
              {isCustomerView && customer ? (
                <Avatar className='h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0'>
                  {customer.avatarUrl && (
                    <AvatarImage src={customer.avatarUrl} alt={displayName} />
                  )}
                  <AvatarFallback className='bg-muted text-muted-foreground text-sm sm:text-base font-medium'>
                    {getInitials(customer.firstName, customer.lastName)}
                  </AvatarFallback>
                </Avatar>
              ) : listing ? (
                <div className='flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center bg-muted rounded-lg flex-shrink-0 text-muted-foreground'>
                  <Home className='h-5 w-5 sm:h-6 sm:w-6' />
                </div>
              ) : null}

              {/* Title */}
              <div className='flex-1 min-w-0'>
                <Typography
                  variant='h5'
                  as='h2'
                  className='truncate text-foreground'
                >
                  {displayName}
                </Typography>
                <p className='text-muted-foreground text-xs sm:text-sm'>
                  {isCustomerView
                    ? t('dialog.customerDetail.title')
                    : t('dialog.listingDetail.title')}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className='p-2 -mr-2 hover:bg-muted rounded-full transition-colors active:scale-95 flex-shrink-0 text-muted-foreground'
                aria-label='Close'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Tab Navigation */}
            {customer && listing && (
              <div className='flex gap-1 p-1 bg-muted/60 rounded-lg'>
                <button
                  onClick={() => setCurrentView('customer')}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all',
                    isCustomerView
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Users className='h-4 w-4 inline-block mr-2' />
                  {t('tabs.customers')}
                </button>
                <button
                  onClick={() => setCurrentView('listing')}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all',
                    !isCustomerView
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Home className='h-4 w-4 inline-block mr-2' />
                  {t('tabs.listings')}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className='flex-1 overflow-y-auto overscroll-contain min-h-0 bg-background'>
          {isCustomerView && customer && (
            <div className='p-4 sm:p-6 space-y-5 pb-6'>
              {/* Stats Cards */}
              <div className='grid grid-cols-1 xs:grid-cols-3 gap-3 sm:grid-cols-3'>
                <Card className='p-4'>
                  <div className='flex items-center gap-2 mb-2 text-muted-foreground'>
                    <TrendingUp className='h-4 w-4' />
                    <p className='text-xs font-medium'>
                      {t('table.totalClicks')}
                    </p>
                  </div>
                  {/* eslint-disable-next-line design-system/no-inline-heading-sizes */}
                  <p className='text-2xl font-semibold text-foreground tracking-tight'>
                    {customer.clickedListings.reduce(
                      (sum, l) => sum + l.clickCount,
                      0,
                    )}
                  </p>
                </Card>

                <Card className='p-4'>
                  <div className='flex items-center gap-2 mb-2 text-muted-foreground'>
                    <Eye className='h-4 w-4' />
                    <p className='text-xs font-medium'>
                      {t('dialog.customerDetail.totalListings')}
                    </p>
                  </div>
                  {/* eslint-disable-next-line design-system/no-inline-heading-sizes */}
                  <p className='text-2xl font-semibold text-foreground tracking-tight'>
                    {customer.totalListingsClicked}
                  </p>
                </Card>

                <Card className='p-4'>
                  <div className='flex items-center gap-2 mb-2 text-muted-foreground'>
                    <Calendar className='h-4 w-4' />
                    <p className='text-xs font-medium'>
                      {t('dialog.customerDetail.lastClick')}
                    </p>
                  </div>
                  <p className='text-sm font-medium text-foreground'>
                    {formatDate(customer.clickedListings[0]?.clickedAt || '')}
                  </p>
                </Card>
              </div>

              {/* Contact Info */}
              <section>
                <Typography
                  variant='h6'
                  as='h3'
                  className='mb-3 text-muted-foreground uppercase tracking-wider text-xs font-medium'
                >
                  {t('dialog.customerDetail.contactInfo')}
                </Typography>

                <Card className='p-2 divide-y divide-border'>
                  {/* Email */}
                  <div className='flex items-center gap-3 p-3'>
                    <Mail className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs text-muted-foreground mb-0.5'>
                        {t('table.email')}
                      </p>
                      <p className='font-medium text-sm truncate text-foreground'>
                        {customer.email}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(customer.email, 'email')
                      }
                      className='p-2 hover:bg-muted rounded-md transition-colors active:scale-95 flex-shrink-0 text-muted-foreground'
                      aria-label='Copy email'
                    >
                      <Copy className='h-4 w-4' />
                    </button>
                  </div>

                  {/* Phone */}
                  {customer.contactPhone && (
                    <div className='flex items-center gap-3 p-3'>
                      <Phone className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-0.5 flex-wrap'>
                          <p className='text-xs text-muted-foreground'>
                            {t('table.phone')}
                          </p>
                          {customer.contactPhoneVerified && (
                            <Badge
                              variant='secondary'
                              className='text-2xs h-5 px-1.5'
                            >
                              <CheckCircle2 className='h-2.5 w-2.5 mr-0.5' />
                              {t('table.verified')}
                            </Badge>
                          )}
                        </div>
                        <p className='font-medium text-sm text-foreground'>
                          {customer.contactPhone}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(customer.contactPhone, 'phone')
                        }
                        className='p-2 hover:bg-muted rounded-md transition-colors active:scale-95 flex-shrink-0 text-muted-foreground'
                        aria-label='Copy phone'
                      >
                        <Copy className='h-4 w-4' />
                      </button>
                    </div>
                  )}
                </Card>
              </section>

              {/* Click History */}
              <section>
                <Typography
                  variant='h6'
                  as='h3'
                  className='mb-3 text-muted-foreground uppercase tracking-wider text-xs font-medium'
                >
                  {t('dialog.customerDetail.clickHistory')} (
                  {customer.clickedListings.length})
                </Typography>

                <div className='space-y-2'>
                  {customer.clickedListings.map((listingItem) => {
                    const handleKeyDown = (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        switchToListing(listingItem)
                      }
                    }

                    return (
                      <Card
                        key={listingItem.listingId}
                        role='button'
                        tabIndex={0}
                        className='group p-3 hover:bg-muted/40 transition-colors cursor-pointer active:scale-[0.99]'
                        onClick={() => switchToListing(listingItem)}
                        onKeyDown={handleKeyDown}
                        aria-label={`View listing: ${listingItem.listingTitle}`}
                      >
                        <div className='flex items-start gap-3'>
                          <div className='flex-1 min-w-0'>
                            <h4 className='font-medium text-sm text-foreground mb-1 line-clamp-2'>
                              {listingItem.listingTitle}
                            </h4>
                            <div className='text-xs text-muted-foreground flex items-center gap-2 flex-wrap'>
                              <span className='flex items-center gap-1'>
                                <Calendar className='h-3 w-3' />
                                {formatDate(listingItem.clickedAt)}
                              </span>
                              <span>·</span>
                              <span>
                                {listingItem.clickCount}{' '}
                                {t('dialog.customerDetail.times')}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className='h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors flex-shrink-0 mt-0.5' />
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </section>
            </div>
          )}

          {!isCustomerView && listing && (
            <div className='p-4 sm:p-6 space-y-5 pb-6'>
              {/* Stats */}
              <div className='grid grid-cols-2 gap-3'>
                <Card className='p-4'>
                  {loadingStats ? (
                    <Loader2 className='h-5 w-5 mb-2 animate-spin text-muted-foreground' />
                  ) : (
                    <>
                      <div className='flex items-center gap-2 mb-2 text-muted-foreground'>
                        <MousePointerClick className='h-4 w-4' />
                        <p className='text-xs font-medium'>
                          {t('dialog.listingDetail.totalClicks')}
                        </p>
                      </div>
                      {/* eslint-disable-next-line design-system/no-inline-heading-sizes */}
                      <p className='text-2xl font-semibold text-foreground tracking-tight'>
                        {stats?.totalClicks || listing.clickCount}
                      </p>
                    </>
                  )}
                </Card>

                <Card className='p-4'>
                  {loadingStats ? (
                    <Loader2 className='h-5 w-5 mb-2 animate-spin text-muted-foreground' />
                  ) : (
                    <>
                      <div className='flex items-center gap-2 mb-2 text-muted-foreground'>
                        <Users className='h-4 w-4' />
                        <p className='text-xs font-medium'>
                          {t('dialog.listingDetail.uniqueUsers')}
                        </p>
                      </div>
                      {/* eslint-disable-next-line design-system/no-inline-heading-sizes */}
                      <p className='text-2xl font-semibold text-foreground tracking-tight'>
                        {stats?.uniqueUsers || usersData?.data.length || 0}
                      </p>
                    </>
                  )}
                </Card>
              </div>

              {/* Interested Users List */}
              <section>
                <Typography
                  variant='h6'
                  as='h3'
                  className='mb-3 text-muted-foreground uppercase tracking-wider text-xs font-medium'
                >
                  {t('dialog.listingDetail.interestedUsers')}
                </Typography>

                {loadingUsers ? (
                  <div className='flex items-center justify-center py-12'>
                    <Loader2 className='h-5 w-5 animate-spin text-muted-foreground mr-2' />
                    <span className='text-sm text-muted-foreground'>
                      {t('dialog.listingDetail.loadingUsers')}
                    </span>
                  </div>
                ) : !usersData?.data || usersData.data.length === 0 ? (
                  <div className='text-center py-12'>
                    <Users className='h-10 w-10 text-muted-foreground/40 mx-auto mb-3' />
                    <p className='text-sm text-muted-foreground'>
                      {t('dialog.listingDetail.noUsers')}
                    </p>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {usersData.data.map((user: UserPhoneClickDetail) => (
                      <InterestedUserCard
                        key={user.userId}
                        user={user}
                        listingId={listing.listingId}
                        clickCountLabel={t('dialog.customerDetail.times')}
                        onUserClick={switchToCustomer}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
