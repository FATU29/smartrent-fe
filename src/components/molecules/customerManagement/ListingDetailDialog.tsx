'use client'

import { useTranslations } from 'next-intl'
import {
  X,
  Users,
  MousePointerClick,
  Mail,
  Phone,
  CheckCircle2,
  Loader2,
  Home,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import { Dialog } from '@/components/atoms/dialog'
import { Typography } from '@/components/atoms/typography'
import {
  useUsersWhoClickedListing,
  usePhoneClickStats,
} from '@/hooks/usePhoneClickDetails'
import type {
  ListingClickInfo,
  UserPhoneClickDetail,
} from '@/api/types/phone-click-detail.type'

interface ListingDetailDialogProps {
  listing: ListingClickInfo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewCustomer?: (userId: string) => void
}

export default function ListingDetailDialog({
  listing,
  open,
  onOpenChange,
  onViewCustomer,
}: ListingDetailDialogProps) {
  const t = useTranslations('seller.customers')

  // Fetch users who clicked and stats
  const { data: usersData, isLoading: loadingUsers } =
    useUsersWhoClickedListing(listing?.listingId || 0, 1, 10)
  const { data: stats, isLoading: loadingStats } = usePhoneClickStats(
    listing?.listingId || 0,
  )

  if (!listing) return null

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className='fixed inset-0 z-50 flex items-center justify-center'>
        {/* Backdrop */}
        <div
          role='button'
          tabIndex={0}
          className='absolute inset-0 bg-black/50 backdrop-blur-sm'
          onClick={() => onOpenChange(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onOpenChange(false)
            }
          }}
          aria-label='Close dialog'
        />

        {/* Dialog Content */}
        <div className='relative z-50 w-full max-w-3xl max-h-[90vh] overflow-hidden bg-card rounded-2xl shadow-2xl m-4 animate-in fade-in-0 zoom-in-95 duration-200'>
          {/* Header with gradient */}
          <div className='relative bg-primary p-6 text-primary-foreground'>
            <button
              onClick={() => onOpenChange(false)}
              className='absolute top-4 right-4 p-2 rounded-full hover:bg-primary-foreground/20 transition-colors'
            >
              <X className='h-5 w-5' />
            </button>

            <div className='flex items-center gap-4'>
              <div className='p-4 bg-primary-foreground/20 rounded-xl backdrop-blur-sm'>
                <Home className='h-8 w-8' />
              </div>

              <div className='flex-1'>
                <Typography
                  variant='h3'
                  as='h2'
                  className='font-bold mb-1 line-clamp-2'
                >
                  {listing.listingTitle}
                </Typography>
                <p className='text-primary-foreground/80 text-sm'>
                  {t('dialog.listingDetail.title')}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='p-6 overflow-y-auto max-h-[calc(90vh-180px)]'>
            {/* Statistics Cards */}
            <div className='grid grid-cols-2 gap-4 mb-6'>
              <Card className='p-5 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'>
                {loadingStats ? (
                  <Loader2 className='h-6 w-6 mx-auto mb-2 animate-spin text-primary' />
                ) : (
                  <>
                    <MousePointerClick className='h-7 w-7 mx-auto mb-2 text-primary' />
                    <p className='text-3xl font-bold text-primary'>
                      {stats?.totalClicks || listing.clickCount}
                    </p>
                    <p className='text-sm text-muted-foreground mt-1'>
                      {t('dialog.listingDetail.totalClicks')}
                    </p>
                  </>
                )}
              </Card>

              <Card className='p-5 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'>
                {loadingStats ? (
                  <Loader2 className='h-6 w-6 mx-auto mb-2 animate-spin text-primary' />
                ) : (
                  <>
                    <Users className='h-7 w-7 mx-auto mb-2 text-primary' />
                    <p className='text-3xl font-bold text-primary'>
                      {stats?.uniqueUsers || usersData?.data.length || 0}
                    </p>
                    <p className='text-sm text-muted-foreground mt-1'>
                      {t('dialog.listingDetail.uniqueUsers')}
                    </p>
                  </>
                )}
              </Card>
            </div>

            {/* Interested Users */}
            <Card className='p-5 border-l-4 border-primary'>
              <Typography
                variant='h5'
                as='h3'
                className='mb-4 flex items-center gap-2'
              >
                <Users className='h-5 w-5 text-primary' />
                {t('dialog.listingDetail.interestedUsers')}
              </Typography>

              {loadingUsers ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  <span className='ml-2 text-muted-foreground'>
                    {t('dialog.listingDetail.loadingUsers')}
                  </span>
                </div>
              ) : !usersData?.data || usersData.data.length === 0 ? (
                <div className='text-center py-8'>
                  <Users className='h-12 w-12 text-muted-foreground/40 mx-auto mb-3' />
                  <p className='text-muted-foreground'>
                    {t('dialog.listingDetail.noUsers')}
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {usersData.data.map((user: UserPhoneClickDetail) => {
                    const userClickCount = user.clickedListings
                      .filter(
                        (l: ListingClickInfo) =>
                          l.listingId === listing.listingId,
                      )
                      .reduce(
                        (sum: number, l: ListingClickInfo) =>
                          sum + l.clickCount,
                        0,
                      )

                    const handleKeyDown = (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onViewCustomer?.(user.userId)
                      }
                    }

                    return (
                      <div
                        key={user.userId}
                        role='button'
                        tabIndex={0}
                        className='group p-4 bg-muted/40 hover:bg-primary/5 rounded-lg border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer'
                        onClick={() => onViewCustomer?.(user.userId)}
                        onKeyDown={handleKeyDown}
                        aria-label={`View customer: ${user.firstName} ${user.lastName}`}
                      >
                        <div className='flex items-center gap-4'>
                          <Avatar className='h-12 w-12 border-2 border-card shadow'>
                            {user.avatarUrl && (
                              <AvatarImage
                                src={user.avatarUrl}
                                alt={`${user.firstName} ${user.lastName}`}
                              />
                            )}
                            <AvatarFallback className='bg-primary text-primary-foreground'>
                              {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>

                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-1'>
                              <h4 className='font-semibold text-foreground truncate group-hover:text-primary transition-colors'>
                                {user.firstName} {user.lastName}
                              </h4>
                              {user.contactPhoneVerified && (
                                <CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0' />
                              )}
                            </div>

                            <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                              <div className='flex items-center gap-1'>
                                <Mail className='h-3.5 w-3.5' />
                                <span className='truncate'>{user.email}</span>
                              </div>
                              {user.contactPhone && (
                                <div className='flex items-center gap-1'>
                                  <Phone className='h-3.5 w-3.5' />
                                  <span>{user.contactPhone}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className='flex flex-col items-end gap-1'>
                            <Badge variant='secondary' className='text-xs'>
                              {userClickCount} {t('listingCard.clicks')}
                            </Badge>
                            <span className='text-xs text-muted-foreground'>
                              {formatDate(
                                user.clickedListings[0]?.clickedAt || '',
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {usersData &&
                    usersData.totalElements > usersData.data.length && (
                      <div className='text-center pt-4'>
                        <p className='text-sm text-muted-foreground'>
                          {t('pagination.showing')} {usersData.data.length} /{' '}
                          {usersData.totalElements} {t('pagination.results')}
                        </p>
                      </div>
                    )}
                </div>
              )}
            </Card>
          </div>

          {/* Footer */}
          <div className='border-t p-4 bg-muted/40 flex justify-end'>
            <Button onClick={() => onOpenChange(false)} variant='outline'>
              {t('dialog.listingDetail.close')}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
