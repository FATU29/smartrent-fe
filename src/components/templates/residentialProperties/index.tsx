import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import PropertyListContent from '@/components/molecules/propertyListContent'

import PropertyFilterSidebar from '@/components/molecules/propertyFilterSidebar'
import { Typography } from '@/components/atoms/typography'
import { Switch } from '@/components/atoms/switch'
import { useListContext } from '@/contexts/list'
import { ListingDetail } from '@/api/types/property.type'
import ResidentialFilterResponsive from '@/components/molecules/residentialFilterResponsive'

const ResidentialPropertiesTemplate: React.FC = () => {
  const t = useTranslations('propertiesPage')
  const { pagination } = useListContext<ListingDetail>()
  const [emailNotification, setEmailNotification] = useState(false)

  return (
    <>
      {/* Filter Bar - At the top */}
      <div className='mb-6'>
        <ResidentialFilterResponsive />
      </div>

      {/* Header Section */}
      <header className='space-y-4 mb-6'>
        {/* Title and Controls */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='space-y-2'>
            <Typography variant='p' className='text-muted-foreground'>
              {t('listingCount', { count: pagination.totalCount })}
            </Typography>
          </div>

          <div className='flex items-center gap-4'>
            {/* Email Notification Toggle */}
            <div className='flex items-center gap-2'>
              <Switch
                checked={emailNotification}
                onCheckedChange={setEmailNotification}
                size='sm'
              />
              <Typography variant='small' className='text-sm whitespace-nowrap'>
                {t('emailNotification')}
              </Typography>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Left Column - Property List */}
        <main className='flex-1'>
          <PropertyListContent />
        </main>

        {/* Right Column - Filter Sidebar - Desktop Only */}
        <aside className='hidden lg:block lg:w-80 xl:w-96 flex-shrink-0'>
          <PropertyFilterSidebar />
        </aside>
      </div>
    </>
  )
}

export default ResidentialPropertiesTemplate
