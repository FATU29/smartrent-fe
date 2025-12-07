'use client'

import React from 'react'
import { NextPageWithLayout } from '@/types/next-page'
import MainLayout from '@/components/layouts/homePageLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import SavedListingsTemplate from '@/components/templates/savedListingsTemplate'
import { List } from '@/contexts/list'
import { SavedListingService } from '@/api/services'
import type { SavedListing } from '@/api/types'

/**
 * Saved Listings Page
 * Uses List Context for clean pagination management
 * Client-side only - requires authentication
 */
const SavedListingsPage: NextPageWithLayout = () => {
  const t = useTranslations('savedListings')

  // Fetcher function that integrates with List Context
  const fetchSavedListings = async (filters: {
    page?: number
    size?: number
  }) => {
    const response = await SavedListingService.getMySaved({
      page: filters.page || 1,
      size: filters.size || 12,
    })

    // Transform response to match List Context expected format
    return {
      data: {
        listings: response.data?.data || [],
        pagination: {
          totalCount: response.data?.totalElements || 0,
          currentPage: response.data?.page || 1,
          totalPages: response.data?.totalPages || 0,
          pageSize: response.data?.size || 12,
        },
      },
      message: response.message,
      code: response.code,
      success: response.success,
    }
  }

  return (
    <>
      <SeoHead
        title={`${t('title')} – SmartRent`}
        description={t('subtitle')}
        openGraph={{
          type: 'website',
        }}
      />
      <List.Provider<SavedListing>
        fetcher={fetchSavedListings}
        initialFilters={{ page: 1, size: 12 }}
      >
        <SavedListingsTemplate />
      </List.Provider>
    </>
  )
}

SavedListingsPage.getLayout = (page) => (
  <MainLayout activeItem='savedListings'>{page}</MainLayout>
)

export default SavedListingsPage
