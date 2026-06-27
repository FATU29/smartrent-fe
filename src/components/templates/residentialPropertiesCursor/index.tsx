import React from 'react'
import Image from 'next/image'
import CursorPropertyList from '@/components/molecules/cursorPropertyList'
import PropertyFilterSidebar from '@/components/molecules/propertyFilterSidebar'
import ResidentialFilterResponsive from '@/components/molecules/residentialFilterResponsive'

/**
 * Cursor (load-more) variant of {@link ResidentialPropertiesTemplate}. Same
 * filter bar + sidebar, but the listing column is driven by keyset pagination
 * via {@link CursorPropertyList} instead of the offset/numbered flow. Kept as a
 * separate template so the shared offset experience is untouched.
 */
const ResidentialPropertiesCursorTemplate: React.FC = () => {
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
          <div className='absolute inset-0 bg-gradient-to-r from-black/55 via-black/40 to-black/20 dark:from-background/75 dark:via-background/55 dark:to-background/25' />
        </div>

        <div className='relative p-4 sm:p-6'>
          <div className='backdrop-blur-sm bg-white/75 dark:bg-card/70 p-3 sm:p-4 rounded-xl shadow-lg ring-1 ring-white/40 dark:ring-white/10'>
            <ResidentialFilterResponsive hideVerifiedFilterInDialog />
          </div>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Left Column - Property List */}
        <main className='flex-1'>
          <CursorPropertyList />
        </main>

        {/* Right Column - Filter Sidebar - Desktop Only */}
        <aside className='hidden lg:block lg:w-80 xl:w-96 flex-shrink-0'>
          <PropertyFilterSidebar />
        </aside>
      </div>
    </>
  )
}

export default ResidentialPropertiesCursorTemplate
