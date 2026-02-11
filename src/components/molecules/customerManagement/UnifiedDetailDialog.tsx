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
        <header className='relative bg-primary text-white flex-shrink-0'>
          <div className='px-4 py-4 sm:px-6 sm:py-5'>
            <div className='flex items-center gap-3 mb-4'>
              {/* Back button */}
              {canGoBack && (
                <button
                  onClick={() =>
                    setCurrentView(isCustomerView ? 'listing' : 'customer')
                  }
                  className='p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors active:scale-95'
                  aria-label='Go back'
                >
                  <ArrowLeft className='h-5 w-5' />
                </button>
              )}

              {/* Avatar/Icon */}
              {isCustomerView && customer ? (
                <Avatar className='h-12 w-12 sm:h-14 sm:w-14 border-2 border-white shadow-lg flex-shrink-0'>
                  {customer.avatarUrl && (
                    <AvatarImage src={customer.avatarUrl} alt={displayName} />
                  )}
                  <AvatarFallback className='text-base sm:text-lg bg-white text-primary font-bold'>
                    {getInitials(customer.firstName, customer.lastName)}
                  </AvatarFallback>
                </Avatar>
              ) : listing ? (
                <div className='p-2.5 sm:p-3 bg-white/20 rounded-xl flex-shrink-0'>
                  <Home className='h-6 w-6 sm:h-7 sm:w-7' />
                </div>
              ) : null}

              {/* Title */}
              <div className='flex-1 min-w-0'>
                <h2 className='text-base sm:text-xl font-bold truncate'>
                  {displayName}
                </h2>
                <p className='text-white/80 text-xs sm:text-sm'>
                  {isCustomerView
                    ? t('dialog.customerDetail.title')
                    : t('dialog.listingDetail.title')}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className='p-2 -mr-2 hover:bg-white/20 rounded-full transition-colors active:scale-95 flex-shrink-0'
                aria-label='Close'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Tab Navigation */}
            {customer && listing && (
              <div className='flex gap-2'>
                <button
                  onClick={() => setCurrentView('customer')}
                  className={cn(
                    'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all',
                    isCustomerView
                      ? 'bg-white text-primary shadow-md'
                      : 'bg-white/10 text-white/80 hover:bg-white/20',
                  )}
                >
                  <Users className='h-4 w-4 inline-block mr-2' />
                  {t('tabs.customers')}
                </button>
                <button
                  onClick={() => setCurrentView('listing')}
                  className={cn(
                    'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all',
                    !isCustomerView
                      ? 'bg-white text-primary shadow-md'
                      : 'bg-white/10 text-white/80 hover:bg-white/20',
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
            <div className='p-4 sm:p-6 space-y-4 pb-6'>
              {/* Stats Cards */}
              <div className='grid grid-cols-1 xs:grid-cols-3 gap-3 sm:grid-cols-3'>
                <Card className='p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'>
                  <TrendingUp className='h-5 w-5 mb-2 text-primary' />
                  <p className='text-2xl font-bold text-primary'>
                    {customer.clickedListings.reduce(
                      (sum, l) => sum + l.clickCount,
                      0,
                    )}
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {t('table.totalClicks')}
                  </p>
                </Card>

                <Card className='p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'>
                  <Eye className='h-5 w-5 mb-2 text-primary' />
                  <p className='text-2xl font-bold text-primary'>
                    {customer.totalListingsClicked}
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {t('dialog.customerDetail.totalListings')}
                  </p>
                </Card>

                <Card className='p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'>
                  <Calendar className='h-5 w-5 mb-2 text-primary' />
                  <p className='text-xs font-semibold text-primary mb-1'>
                    {t('dialog.customerDetail.lastClick')}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {formatDate(customer.clickedListings[0]?.clickedAt || '')}
                  </p>
                </Card>
              </div>

              {/* Contact Info */}
              <Card className='p-4 border-l-4 border-primary'>
                <h3 className='text-base font-semibold mb-4 flex items-center gap-2'>
                  <Phone className='h-5 w-5 text-primary' />
                  {t('dialog.customerDetail.contactInfo')}
                </h3>

                <div className='space-y-3'>
                  {/* Email */}
                  <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
                    <Mail className='h-5 w-5 text-muted-foreground flex-shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs text-muted-foreground mb-0.5'>
                        {t('table.email')}
                      </p>
                      <p className='font-medium text-sm truncate'>
                        {customer.email}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(customer.email, 'email')
                      }
                      className='p-2 hover:bg-primary/10 rounded-lg transition-colors active:scale-95 flex-shrink-0'
                      aria-label='Copy email'
                    >
                      <Copy className='h-4 w-4 text-primary' />
                    </button>
                  </div>

                  {/* Phone */}
                  {customer.contactPhone && (
                    <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
                      <Phone className='h-5 w-5 text-muted-foreground flex-shrink-0' />
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-0.5 flex-wrap'>
                          <p className='text-xs text-muted-foreground'>
                            {t('table.phone')}
                          </p>
                          {customer.contactPhoneVerified && (
                            <Badge
                              variant='outline'
                              className='text-[10px] h-5 px-1.5 border-green-600 text-green-600'
                            >
                              <CheckCircle2 className='h-2.5 w-2.5 mr-0.5' />
                              {t('table.verified')}
                            </Badge>
                          )}
                        </div>
                        <p className='font-medium text-sm'>
                          {customer.contactPhone}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(customer.contactPhone, 'phone')
                        }
                        className='p-2 hover:bg-primary/10 rounded-lg transition-colors active:scale-95 flex-shrink-0'
                        aria-label='Copy phone'
                      >
                        <Copy className='h-4 w-4 text-primary' />
                      </button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Click History */}
              <Card className='p-4 border-l-4 border-primary'>
                <h3 className='text-base font-semibold mb-4 flex items-center gap-2'>
                  <Calendar className='h-5 w-5 text-primary' />
                  {t('dialog.customerDetail.clickHistory')} (
                  {customer.clickedListings.length})
                </h3>

                <div className='space-y-3'>
                  {customer.clickedListings.map((listingItem, index) => {
                    const handleKeyDown = (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        switchToListing(listingItem)
                      }
                    }

                    return (
                      <div
                        key={listingItem.listingId}
                        role='button'
                        tabIndex={0}
                        className='group p-3 bg-muted/50 hover:bg-primary/5 rounded-lg border border-border hover:border-primary/30 transition-all cursor-pointer active:scale-[0.98]'
                        onClick={() => switchToListing(listingItem)}
                        onKeyDown={handleKeyDown}
                        aria-label={`View listing: ${listingItem.listingTitle}`}
                      >
                        <div className='flex items-start gap-3'>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-2 flex-wrap'>
                              <Badge variant='secondary' className='text-xs'>
                                #{index + 1}
                              </Badge>
                              <Badge variant='outline' className='text-xs'>
                                {listingItem.clickCount}{' '}
                                {t('dialog.customerDetail.times')}
                              </Badge>
                            </div>
                            <h4 className='font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2'>
                              {listingItem.listingTitle}
                            </h4>
                            <p className='text-xs text-muted-foreground flex items-center gap-1'>
                              <Calendar className='h-3 w-3' />
                              {formatDate(listingItem.clickedAt)}
                            </p>
                          </div>
                          <ExternalLink className='h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1' />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          )}

          {!isCustomerView && listing && (
            <div className='p-4 sm:p-6 space-y-4 pb-6'>
              {/* Stats */}
              <div className='grid grid-cols-2 gap-3'>
                <Card className='p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'>
                  {loadingStats ? (
                    <Loader2 className='h-5 w-5 mb-2 animate-spin text-primary' />
                  ) : (
                    <>
                      <MousePointerClick className='h-5 w-5 mb-2 text-primary' />
                      <p className='text-2xl font-bold text-primary'>
                        {stats?.totalClicks || listing.clickCount}
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        {t('dialog.listingDetail.totalClicks')}
                      </p>
                    </>
                  )}
                </Card>

                <Card className='p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'>
                  {loadingStats ? (
                    <Loader2 className='h-5 w-5 mb-2 animate-spin text-primary' />
                  ) : (
                    <>
                      <Users className='h-5 w-5 mb-2 text-primary' />
                      <p className='text-2xl font-bold text-primary'>
                        {stats?.uniqueUsers || usersData?.data.length || 0}
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        {t('dialog.listingDetail.uniqueUsers')}
                      </p>
                    </>
                  )}
                </Card>
              </div>

              {/* Interested Users List */}
              <Card className='p-4 border-l-4 border-primary'>
                <h3 className='text-base font-semibold mb-4 flex items-center gap-2'>
                  <Users className='h-5 w-5 text-primary' />
                  {t('dialog.listingDetail.interestedUsers')}
                </h3>

                {loadingUsers ? (
                  <div className='flex items-center justify-center py-12'>
                    <Loader2 className='h-6 w-6 animate-spin text-primary mr-2' />
                    <span className='text-sm text-muted-foreground'>
                      {t('dialog.listingDetail.loadingUsers')}
                    </span>
                  </div>
                ) : !usersData?.data || usersData.data.length === 0 ? (
                  <div className='text-center py-12'>
                    <Users className='h-12 w-12 text-muted-foreground/30 mx-auto mb-3' />
                    <p className='text-sm text-muted-foreground'>
                      {t('dialog.listingDetail.noUsers')}
                    </p>
                  </div>
                ) : (
                  <div className='space-y-3'>
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
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
