'use client'

import { useTranslations } from 'next-intl'
import {
  X,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Copy,
  Calendar,
  TrendingUp,
  Eye,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import { Dialog } from '@/components/atoms/dialog'
import type { UserPhoneClickDetail } from '@/api/types/phone-click-detail.type'
import { copyToClipboard, getInitials, formatDate } from './utils'

interface CustomerDetailDialogProps {
  customer: UserPhoneClickDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewListing?: (listingId: number) => void
}

export default function CustomerDetailDialog({
  customer,
  open,
  onOpenChange,
  onViewListing,
}: CustomerDetailDialogProps) {
  const t = useTranslations('seller.customers')

  if (!customer) return null

  const handleCopyToClipboard = (text: string, type: 'phone' | 'email') => {
    copyToClipboard(text, type, {
      phone: t('copiedPhone'),
      email: t('copiedEmail'),
    })
  }

  const totalClicks = customer.clickedListings.reduce(
    (sum, l) => sum + l.clickCount,
    0,
  )
  const lastClick = customer.clickedListings[0]

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
        <div className='relative z-50 w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl m-4 animate-in fade-in-0 zoom-in-95 duration-200'>
          {/* Header with gradient */}
          <div className='relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white'>
            <button
              onClick={() => onOpenChange(false)}
              className='absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors'
            >
              <X className='h-5 w-5' />
            </button>

            <div className='flex items-center gap-4'>
              <Avatar className='h-20 w-20 border-4 border-white shadow-lg'>
                {customer.avatarUrl && (
                  <AvatarImage
                    src={customer.avatarUrl}
                    alt={`${customer.firstName} ${customer.lastName}`}
                  />
                )}
                <AvatarFallback className='text-2xl bg-white text-blue-600'>
                  {getInitials(customer.firstName, customer.lastName)}
                </AvatarFallback>
              </Avatar>

              <div className='flex-1'>
                <h2 className='text-2xl font-bold mb-1'>
                  {customer.firstName} {customer.lastName}
                </h2>
                <p className='text-blue-100 text-sm'>
                  {t('dialog.customerDetail.title')}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='p-6 overflow-y-auto max-h-[calc(90vh-180px)]'>
            {/* Statistics Cards */}
            <div className='grid grid-cols-3 gap-4 mb-6'>
              <Card className='p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'>
                <TrendingUp className='h-6 w-6 mx-auto mb-2 text-blue-600' />
                <p className='text-2xl font-bold text-blue-900'>
                  {totalClicks}
                </p>
                <p className='text-xs text-blue-700 mt-1'>
                  {t('table.totalClicks')}
                </p>
              </Card>

              <Card className='p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'>
                <Eye className='h-6 w-6 mx-auto mb-2 text-purple-600' />
                <p className='text-2xl font-bold text-purple-900'>
                  {customer.totalListingsClicked}
                </p>
                <p className='text-xs text-purple-700 mt-1'>
                  {t('dialog.customerDetail.totalListings')}
                </p>
              </Card>

              <Card className='p-4 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200'>
                <Calendar className='h-6 w-6 mx-auto mb-2 text-green-600' />
                <p className='text-xs font-semibold text-green-900 mb-1'>
                  {t('dialog.customerDetail.lastClick')}
                </p>
                <p className='text-xs text-green-700'>
                  {formatDate(lastClick?.clickedAt || '')}
                </p>
              </Card>
            </div>

            {/* Contact Information */}
            <Card className='p-5 mb-6 border-l-4 border-blue-500'>
              <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <Mail className='h-5 w-5 text-blue-600' />
                {t('dialog.customerDetail.contactInfo')}
              </h3>

              <div className='space-y-3'>
                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <Mail className='h-5 w-5 text-gray-400' />
                    <div>
                      <p className='text-xs text-gray-500'>
                        {t('table.email')}
                      </p>
                      <p className='font-medium text-gray-900'>
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyToClipboard(customer.email, 'email')
                    }
                    className='p-2 hover:bg-gray-200 rounded-lg transition-colors'
                  >
                    <Copy className='h-4 w-4 text-gray-600' />
                  </button>
                </div>

                {customer.contactPhone && (
                  <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                    <div className='flex items-center gap-3'>
                      <Phone className='h-5 w-5 text-gray-400' />
                      <div>
                        <p className='text-xs text-gray-500 flex items-center gap-2'>
                          {t('table.phone')}
                          {customer.contactPhoneVerified ? (
                            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                              <CheckCircle2 className='h-3 w-3 mr-1' />
                              {t('table.verified')}
                            </span>
                          ) : (
                            <Badge variant='secondary' className='text-xs'>
                              <XCircle className='h-3 w-3 mr-1' />
                              {t('table.notVerified')}
                            </Badge>
                          )}
                        </p>
                        <p className='font-medium text-gray-900'>
                          {customer.contactPhone}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(customer.contactPhone, 'phone')
                      }
                      className='p-2 hover:bg-gray-200 rounded-lg transition-colors'
                    >
                      <Copy className='h-4 w-4 text-gray-600' />
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* Click History */}
            <Card className='p-5 border-l-4 border-purple-500'>
              <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <Calendar className='h-5 w-5 text-purple-600' />
                {t('dialog.customerDetail.clickHistory')}
              </h3>

              <div className='space-y-3'>
                {customer.clickedListings.map((listing, index) => (
                  <div
                    key={listing.listingId}
                    className='group p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <Badge variant='secondary' className='text-xs'>
                            #{index + 1}
                          </Badge>
                          {listing.clickCount > 1 && (
                            <Badge variant='outline' className='text-xs'>
                              {listing.clickCount}{' '}
                              {t('dialog.customerDetail.times')}
                            </Badge>
                          )}
                        </div>
                        <h4 className='font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors'>
                          {listing.listingTitle}
                        </h4>
                        <p className='text-xs text-gray-500 mt-1'>
                          {t('dialog.customerDetail.clickedOn')}{' '}
                          {formatDate(listing.clickedAt)}
                        </p>
                      </div>

                      {onViewListing && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onViewListing(listing.listingId)}
                          className='opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <Eye className='h-4 w-4 mr-1' />
                          {t('dialog.customerDetail.viewListing')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Footer */}
          <div className='border-t p-4 bg-gray-50 flex justify-end'>
            <Button onClick={() => onOpenChange(false)} variant='outline'>
              {t('dialog.customerDetail.close')}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
