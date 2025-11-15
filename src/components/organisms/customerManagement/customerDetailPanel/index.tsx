import React from 'react'
import { Customer } from '@/api/types/customer.type'
import { Avatar, AvatarFallback } from '@/components/atoms/avatar'
import {
  Mail,
  Phone,
  TrendingUp,
  FileText,
  Calendar,
  MapPin,
} from 'lucide-react'
import CopyButton from '@/components/atoms/copy-button'
import { useTranslations } from 'next-intl'
import InteractionBadge from '@/components/molecules/customerManagement/interactionBadge'
import { Card } from '@/components/atoms/card'

interface CustomerDetailPanelProps {
  customer: Customer
}

const CustomerDetailPanel: React.FC<CustomerDetailPanelProps> = ({
  customer,
}) => {
  const t = useTranslations('seller.customers')

  return (
    <div className='h-full flex flex-col bg-card w-full overflow-hidden'>
      {/* Header - Fixed */}
      <div className='shrink-0 p-4 lg:p-6 border-b border-border'>
        <div className='flex items-start gap-3 lg:gap-4'>
          <Avatar className='h-12 w-12 lg:h-16 lg:w-16 shrink-0'>
            <AvatarFallback className='bg-primary/10 text-primary font-semibold text-base lg:text-xl'>
              {customer.initials}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <h2 className='text-lg lg:text-2xl font-bold text-foreground mb-2'>
              {customer.name}
            </h2>
            <div className='space-y-1.5 lg:space-y-2'>
              <div className='flex items-center gap-2'>
                <Phone size={14} className='text-muted-foreground shrink-0' />
                <span className='text-xs lg:text-sm text-foreground truncate'>
                  {customer.phone}
                </span>
                <CopyButton
                  text={customer.phone}
                  successMessage={t('copiedPhone')}
                  iconSize={14}
                />
              </div>
              {customer.email && (
                <div className='flex items-center gap-2'>
                  <Mail size={14} className='text-muted-foreground shrink-0' />
                  <span className='text-xs lg:text-sm text-foreground truncate'>
                    {customer.email}
                  </span>
                  <CopyButton
                    text={customer.email}
                    successMessage={t('copiedEmail')}
                    iconSize={14}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 gap-3 lg:gap-4 mt-4 lg:mt-6'>
          <Card className='p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200'>
            <div className='flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-1'>
              <TrendingUp size={16} />
              <span className='text-xs font-medium'>
                {t('totalInteractions')}
              </span>
            </div>
            <p className='text-2xl font-bold text-blue-900 dark:text-blue-200'>
              {customer.totalInteractions}
            </p>
          </Card>
          <Card className='p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200'>
            <div className='flex items-center gap-2 text-purple-700 dark:text-purple-400 mb-1'>
              <FileText size={16} />
              <span className='text-xs font-medium'>{t('listingsPosted')}</span>
            </div>
            <p className='text-2xl font-bold text-purple-900 dark:text-purple-200'>
              0
            </p>
          </Card>
        </div>
      </div>

      {/* Interaction History - Scrollable */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden'>
        <div className='p-4 lg:p-6'>
          <h3 className='text-base lg:text-lg font-semibold text-foreground mb-3 lg:mb-4'>
            {t('interactionHistory')}
          </h3>

          <div className='space-y-3'>
            {customer.interactions.map((interaction) => (
              <Card
                key={interaction.id}
                className='p-3 lg:p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/50'
              >
                <div className='flex items-start justify-between gap-2 lg:gap-3 mb-2 lg:mb-3'>
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-semibold text-sm lg:text-base text-foreground mb-1.5 lg:mb-2 line-clamp-2'>
                      {interaction.listingTitle}
                    </h4>
                    <div className='flex items-start gap-1.5 text-xs lg:text-sm text-muted-foreground'>
                      <MapPin
                        size={12}
                        className='text-muted-foreground/70 mt-0.5 shrink-0'
                      />
                      <p className='line-clamp-2'>
                        {interaction.listingAddress}
                      </p>
                    </div>
                  </div>
                  <div className='text-right shrink-0'>
                    <div className='flex items-center gap-1 lg:gap-1.5 text-xs text-muted-foreground'>
                      <Calendar
                        size={10}
                        className='text-muted-foreground/70'
                      />
                      <span className='text-xs'>{interaction.timestamp}</span>
                    </div>
                  </div>
                </div>

                <InteractionBadge type={interaction.type} />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDetailPanel
