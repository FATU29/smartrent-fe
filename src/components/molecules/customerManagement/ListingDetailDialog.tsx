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
        <div className='relative z-50 w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl m-4 animate-in fade-in-0 zoom-in-95 duration-200'>
          {/* Header with gradient */}
          <div className='relative bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white'>
            <button
              onClick={() => onOpenChange(false)}
              className='absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors'
            >
              <X className='h-5 w-5' />
            </button>

            <div className='flex items-center gap-4'>
              <div className='p-4 bg-white/20 rounded-xl backdrop-blur-sm'>
                <Home className='h-8 w-8' />
              </div>

              <div className='flex-1'>
                <h2 className='text-2xl font-bold mb-1 line-clamp-2'>
                  {listing.listingTitle}
                </h2>
                <p className='text-green-100 text-sm'>
                  {t('dialog.listingDetail.title')}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='p-6 overflow-y-auto max-h-[calc(90vh-180px)]'>
            {/* Statistics Cards */}
            <div className='grid grid-cols-2 gap-4 mb-6'>
              <Card className='p-5 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200'>
                {loadingStats ? (
                  <Loader2 className='h-6 w-6 mx-auto mb-2 animate-spin text-green-600' />
                ) : (
                  <>
                    <MousePointerClick className='h-7 w-7 mx-auto mb-2 text-green-600' />
                    <p className='text-3xl font-bold text-green-900'>
                      {stats?.totalClicks || listing.clickCount}
                    </p>
                    <p className='text-sm text-green-700 mt-1'>
                      {t('dialog.listingDetail.totalClicks')}
                    </p>
                  </>
                )}
              </Card>

              <Card className='p-5 text-center bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200'>
                {loadingStats ? (
                  <Loader2 className='h-6 w-6 mx-auto mb-2 animate-spin text-teal-600' />
                ) : (
                  <>
                    <Users className='h-7 w-7 mx-auto mb-2 text-teal-600' />
                    <p className='text-3xl font-bold text-teal-900'>
                      {stats?.uniqueUsers || usersData?.data.length || 0}
                    </p>
                    <p className='text-sm text-teal-700 mt-1'>
                      {t('dialog.listingDetail.uniqueUsers')}
                    </p>
                  </>
                )}
              </Card>
            </div>

            {/* Interested Users */}
            <Card className='p-5 border-l-4 border-green-500'>
              <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <Users className='h-5 w-5 text-green-600' />
                {t('dialog.listingDetail.interestedUsers')}
              </h3>

              {loadingUsers ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
                  <span className='ml-2 text-gray-500'>
                    {t('dialog.listingDetail.loadingUsers')}
                  </span>
                </div>
              ) : !usersData?.data || usersData.data.length === 0 ? (
                <div className='text-center py-8'>
                  <Users className='h-12 w-12 text-gray-300 mx-auto mb-3' />
                  <p className='text-gray-500'>
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
                        className='group p-4 bg-gray-50 hover:bg-green-50 rounded-lg border border-gray-200 hover:border-green-300 transition-all duration-200 cursor-pointer'
                        onClick={() => onViewCustomer?.(user.userId)}
                        onKeyDown={handleKeyDown}
                        aria-label={`View customer: ${user.firstName} ${user.lastName}`}
                      >
                        <div className='flex items-center gap-4'>
                          <Avatar className='h-12 w-12 border-2 border-white shadow'>
                            {user.avatarUrl && (
                              <AvatarImage
                                src={user.avatarUrl}
                                alt={`${user.firstName} ${user.lastName}`}
                              />
                            )}
                            <AvatarFallback className='bg-gradient-to-br from-green-400 to-teal-400 text-white'>
                              {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>

                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-1'>
                              <h4 className='font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors'>
                                {user.firstName} {user.lastName}
                              </h4>
                              {user.contactPhoneVerified && (
                                <CheckCircle2 className='h-4 w-4 text-green-600 flex-shrink-0' />
                              )}
                            </div>

                            <div className='flex items-center gap-3 text-sm text-gray-600'>
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
                            <span className='text-xs text-gray-500'>
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
                        <p className='text-sm text-gray-500'>
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
          <div className='border-t p-4 bg-gray-50 flex justify-end'>
            <Button onClick={() => onOpenChange(false)} variant='outline'>
              {t('dialog.listingDetail.close')}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
