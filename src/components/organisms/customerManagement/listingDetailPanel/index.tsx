import React from 'react'
import { ListingWithCustomers } from '@/api/types/customer.type'
import { MapPin, Eye, Clock, Calendar, Mail, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { formatByLocale } from '@/utils/currency/convert'
import Image from 'next/image'
import { Avatar, AvatarFallback } from '@/components/atoms/avatar'
import CopyButton from '@/components/atoms/copy-button'
import InteractionBadge from '@/components/molecules/customerManagement/interactionBadge'
import { Badge } from '@/components/atoms/badge'
import { Card } from '@/components/atoms/card'

interface ListingDetailPanelProps {
  listing: ListingWithCustomers
  language: string
}

const ListingDetailPanel: React.FC<ListingDetailPanelProps> = ({
  listing,
  language,
}) => {
  const t = useTranslations('seller.customers')
  const formattedPrice = formatByLocale(listing.price, language)

  return (
    <div className='h-full flex flex-col bg-card w-full overflow-hidden'>
      {/* Header - Fixed */}
      <div className='shrink-0 p-4 lg:p-6 border-b border-border'>
        <div className='flex gap-3 lg:gap-4'>
          {/* Image */}
          <div className='relative w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden shrink-0 bg-muted'>
            {listing.image ? (
              <Image
                src={listing.image}
                alt={listing.title}
                fill
                className='object-cover'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                <span className='text-xs'>No image</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className='flex-1 min-w-0'>
            <h2 className='text-base lg:text-xl font-bold text-foreground mb-1.5 lg:mb-2 line-clamp-2'>
              {listing.title}
            </h2>
            <div className='flex items-start gap-1.5 lg:gap-2 mb-1.5 lg:mb-2'>
              <MapPin
                size={14}
                className='text-muted-foreground mt-0.5 shrink-0'
              />
              <span className='text-xs lg:text-sm text-muted-foreground line-clamp-2'>
                {listing.address}
              </span>
            </div>
            <p className='text-lg lg:text-2xl font-bold text-red-600'>
              {formattedPrice}/{language === 'vi' ? 'tháng' : 'month'}
            </p>
          </div>
        </div>

        {/* Type Badge */}
        <div className='mt-3 lg:mt-4'>
          <Badge variant='secondary' className='text-xs'>
            {listing.propertyType}
          </Badge>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 gap-3 lg:gap-4 mt-4 lg:mt-6'>
          <Card className='p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200'>
            <div className='flex items-center gap-2 text-green-700 dark:text-green-400 mb-1'>
              <Eye size={16} />
              <span className='text-xs font-medium'>
                {t('totalInteractions')}
              </span>
            </div>
            <p className='text-2xl font-bold text-green-900 dark:text-green-200'>
              {listing.totalInteractions}
            </p>
          </Card>
          <Card className='p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200'>
            <div className='flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-1'>
              <Clock size={16} />
              <span className='text-xs font-medium'>{t('lastActivity')}</span>
            </div>
            <p className='text-base font-bold text-orange-900 dark:text-orange-200'>
              {listing.lastActivity}
            </p>
          </Card>
        </div>
      </div>

      {/* Customer Interactions - Scrollable */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden'>
        <div className='p-4 lg:p-6'>
          <h3 className='text-base lg:text-lg font-semibold text-foreground mb-3 lg:mb-4'>
            {t('customerInteractions')}
          </h3>

          <div className='space-y-3'>
            {listing.interactions.map((interaction) => (
              <Card
                key={interaction.id}
                className='p-3 lg:p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/50'
              >
                <div className='flex items-start gap-2 lg:gap-3'>
                  <Avatar className='h-9 w-9 lg:h-10 lg:w-10 shrink-0'>
                    <AvatarFallback className='bg-primary/10 text-primary font-semibold text-xs lg:text-sm'>
                      {interaction.customerInitials}
                    </AvatarFallback>
                  </Avatar>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-2 mb-2 lg:mb-3'>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-semibold text-sm lg:text-base text-foreground mb-1.5 lg:mb-2'>
                          {interaction.customerName}
                        </h4>
                        <div className='flex items-center gap-1.5 lg:gap-2 mb-1'>
                          <Phone
                            size={12}
                            className='text-muted-foreground/70 shrink-0'
                          />
                          <span className='text-xs lg:text-sm text-muted-foreground truncate'>
                            {interaction.customerPhone}
                          </span>
                          <CopyButton
                            text={interaction.customerPhone}
                            successMessage={t('copiedPhone')}
                            iconSize={12}
                          />
                        </div>
                        {interaction.customerEmail && (
                          <div className='flex items-center gap-1.5 lg:gap-2'>
                            <Mail
                              size={12}
                              className='text-muted-foreground/70 shrink-0'
                            />
                            <span className='text-xs lg:text-sm text-muted-foreground truncate'>
                              {interaction.customerEmail}
                            </span>
                            <CopyButton
                              text={interaction.customerEmail}
                              successMessage={t('copiedEmail')}
                              iconSize={12}
                            />
                          </div>
                        )}
                      </div>
                      <div className='text-right shrink-0'>
                        <div className='flex items-center gap-1 text-xs text-muted-foreground mb-1'>
                          <Calendar
                            size={10}
                            className='text-muted-foreground/70'
                          />
                          <span className='text-xs whitespace-nowrap'>
                            {interaction.timestamp}
                          </span>
                        </div>
                        {!interaction.viewed && (
                          <Badge className='bg-red-500 text-white text-xs px-1.5 py-0.5'>
                            {t('new')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <InteractionBadge type={interaction.type} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingDetailPanel
