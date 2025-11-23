import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import ResidentialFilterResponsive from '@/components/molecules/residentialFilterResponsive'
import PropertyListContent from '@/components/molecules/propertyListContent'
import PropertyFilterSidebar from '@/components/molecules/propertyFilterSidebar'
import { Typography } from '@/components/atoms/typography'
import { Switch } from '@/components/atoms/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select'
import { useListContext } from '@/contexts/list'
import { ListingDetail } from '@/api/types'

const ResidentialPropertiesTemplate: React.FC = () => {
  const t = useTranslations('propertiesPage')
  const { pagination } = useListContext<ListingDetail>()
  const [emailNotification, setEmailNotification] = useState(false)
  const [sortBy, setSortBy] = useState('default')

  const handleFavorite = (property: ListingDetail, isFavorite: boolean) => {
    // TODO: Implement favorite functionality
    console.log('Favorite:', property, isFavorite)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    // TODO: Implement sort logic
  }

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
              {t('listingCount', { count: pagination.total.toLocaleString() })}
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

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='default'>{t('sort.default')}</SelectItem>
                <SelectItem value='priceAsc'>{t('sort.priceAsc')}</SelectItem>
                <SelectItem value='priceDesc'>{t('sort.priceDesc')}</SelectItem>
                <SelectItem value='newest'>{t('sort.newest')}</SelectItem>
                <SelectItem value='oldest'>{t('sort.oldest')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Left Column - Property List */}
        <main className='flex-1'>
          <PropertyListContent onFavorite={handleFavorite} />
        </main>

        {/* Right Column - Filter Sidebar - Desktop Only */}
        <aside className='hidden lg:block lg:w-80 xl:w-96 flex-shrink-0'>
          <div className='sticky top-20'>
            <PropertyFilterSidebar />
          </div>
        </aside>
      </div>
    </>
  )
}

export default ResidentialPropertiesTemplate
