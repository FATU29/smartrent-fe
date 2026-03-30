import React from 'react'
import { useTranslations } from 'next-intl'
import PropertyListContent from '@/components/molecules/propertyListContent'

import PropertyFilterSidebar from '@/components/molecules/propertyFilterSidebar'
import { Typography } from '@/components/atoms/typography'
import { useListContext } from '@/contexts/list'
import { ListingDetail } from '@/api/types/property.type'
import ResidentialFilterResponsive from '@/components/molecules/residentialFilterResponsive'
import Image from 'next/image'

const ResidentialPropertiesTemplate: React.FC = () => {
  const t = useTranslations('propertiesPage')
  const { pagination } = useListContext<ListingDetail>()

  return (
    <>
      {/* Filter Bar - At the top */}
      <section className='mb-6 relative rounded-2xl overflow-hidden'>
        <div className='absolute inset-0'>
          <Image
            src='/images/banner-default.jpg'
            alt='Banner default'
            fill
            priority
            quality={85}
            sizes='(max-width: 768px) 100vw, 1280px'
          />
          <div className='absolute inset-0 bg-gradient-to-r from-black/55 via-black/40 to-black/20 dark:from-black/70 dark:via-black/60 dark:to-black/30' />
        </div>

        <div className='relative p-4 sm:p-6'>
          <div className='backdrop-blur-sm bg-white/75 dark:bg-black/50 p-3 sm:p-4 rounded-xl shadow-lg ring-1 ring-white/40 dark:ring-white/10'>
            <ResidentialFilterResponsive hideVerifiedFilterInDialog />
          </div>
        </div>
      </section>

      {/* Header Section */}
      <header className='space-y-4 mb-6'>
        {/* Title and Controls */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='space-y-2'>
            <Typography variant='p' className='text-muted-foreground'>
              {t('listingCount', { count: pagination.totalCount })}
            </Typography>
          </div>

          {/* Controls placeholder (removed email notification switch) */}
          <div className='flex items-center gap-4' />
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
