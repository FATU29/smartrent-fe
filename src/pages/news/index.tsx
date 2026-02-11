import React, { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import NewsListTemplate from '@/components/templates/newsListTemplate'
import { ListProvider } from '@/contexts/list/index.context'
import { NewsService } from '@/api/services/news.service'
import type { ApiResponse } from '@/configs/axios/types'
import { NewsItem, NewsFilterRequest } from '@/api/types/news.type'
import {
  ListingFilterRequest,
  ListingSearchResponse,
} from '@/api/types/property.type'
import type { Pagination } from '@/api/types/pagination.type'
import { PUBLIC_ROUTES } from '@/constants/route'

interface NewsPageProps {
  initialData: NewsItem[]
  initialPagination: Pagination
  initialFilters: Partial<ListingFilterRequest>
  initialCategory?: string | null
}

const NewsPage: NextPageWithLayout<NewsPageProps> = ({
  initialData,
  initialPagination,
  initialFilters,
  initialCategory,
}) => {
  const t = useTranslations('newsPage')
  const router = useRouter()
  const lastPushedFiltersRef = useRef<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    initialCategory ?? undefined,
  )
  const selectedCategoryRef = useRef(selectedCategory)
  selectedCategoryRef.current = selectedCategory

  const pushFiltersToQuery = useCallback(
    (filters: ListingFilterRequest, category?: string) => {
      const filtersKey = JSON.stringify({ ...filters, category })
      if (lastPushedFiltersRef.current === filtersKey) {
        return
      }
      lastPushedFiltersRef.current = filtersKey

      const queryParams: Record<string, string | null> = {}
      if (filters.page && filters.page > 1) {
        queryParams.page = filters.page.toString()
      }
      if (category) {
        queryParams.category = category
      }
      if (filters.keyword) {
        queryParams.keyword = filters.keyword
      }

      router.push(
        {
          pathname: PUBLIC_ROUTES.NEWS,
          query: Object.fromEntries(
            Object.entries(queryParams).filter(([, v]) => v !== null),
          ),
        },
        undefined,
        { shallow: true, scroll: true },
      )
    },
    [router],
  )

  const fetcher = useCallback(
    async (
      filters: ListingFilterRequest,
    ): Promise<ApiResponse<ListingSearchResponse<NewsItem>>> => {
      const category = selectedCategoryRef.current

      // Map ListingFilterRequest to NewsFilterRequest
      const newsFilters: NewsFilterRequest = {
        page: filters.page || 1,
        size: filters.size || 20,
        keyword: filters.keyword || undefined,
        category: category || undefined,
      }

      pushFiltersToQuery(filters, category)

      const response = await NewsService.getList(newsFilters)

      if (!response.success || !response.data) {
        return {
          code: response.code,
          message: response.message,
          success: false,
          data: {
            listings: [],
            pagination: {
              totalCount: 0,
              currentPage: filters.page || 1,
              pageSize: filters.size || 20,
              totalPages: 0,
            },
          },
        }
      }

      const { news, totalItems, currentPage, pageSize, totalPages } =
        response.data

      return {
        code: response.code,
        message: response.message,
        success: true,
        data: {
          listings: news,
          pagination: {
            totalCount: totalItems,
            currentPage,
            pageSize,
            totalPages,
          },
        },
      }
    },
    [pushFiltersToQuery],
  )

  const handleCategoryChange = useCallback(
    (category: string | undefined) => {
      setSelectedCategory(category)
      selectedCategoryRef.current = category

      // Update URL shallowly (no SSR reload)
      const queryParams: Record<string, string> = {}
      if (category) queryParams.category = category

      router.push(
        {
          pathname: PUBLIC_ROUTES.NEWS,
          query: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        },
        undefined,
        { shallow: true },
      )

      // Trigger client-side re-fetch via ListContext
      // Use _t to force a new filtersKey even if page was already 1
      if (listActionsRef.current) {
        listActionsRef.current.updateFilters({
          page: 1,
          _t: Date.now(),
        } as Partial<ListingFilterRequest>)
      }
    },
    [router],
  )

  // Capture ListContext actions so category change can trigger re-fetch
  const listActionsRef = useRef<{
    updateFilters: (f: Partial<ListingFilterRequest>) => void
  } | null>(null)

  const handleListReady = useCallback(
    (actions: {
      updateFilters: (f: Partial<ListingFilterRequest>) => void
    }) => {
      listActionsRef.current = actions
    },
    [],
  )

  return (
    <>
      <SeoHead title={t('seoTitle')} description={t('seoDescription')} />
      <div className='container mx-auto py-6 px-4 md:px-0'>
        <ListProvider<NewsItem>
          fetcher={fetcher}
          initialData={initialData}
          initialFilters={initialFilters}
          initialPagination={initialPagination}
        >
          <NewsListTemplate
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onListReady={handleListReady}
          />
        </ListProvider>
      </div>
    </>
  )
}

NewsPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout activeItem='news'>{page}</MainLayout>
}

// Server-Side Props - Fetch initial data from API
export const getServerSideProps: GetServerSideProps<NewsPageProps> = async (
  context,
) => {
  try {
    const { query } = context

    const page = query.page ? parseInt(query.page as string, 10) : 1
    const size = query.size ? parseInt(query.size as string, 10) : 20
    const category = (query.category as string) || null
    const keyword = (query.keyword as string) || null

    const newsFilters: NewsFilterRequest = {
      page,
      size,
      ...(category ? { category } : {}),
      ...(keyword ? { keyword } : {}),
    }

    const response = await NewsService.getList(newsFilters)

    const initialFilters: Partial<ListingFilterRequest> = {
      page,
      size,
      ...(keyword ? { keyword } : {}),
    }

    if (!response.success || !response.data) {
      return {
        props: {
          initialData: [],
          initialPagination: {
            totalCount: 0,
            currentPage: 1,
            pageSize: 20,
            totalPages: 0,
          },
          initialFilters,
          initialCategory: category ?? null,
        },
      }
    }

    const { news, totalItems, currentPage, pageSize, totalPages } =
      response.data

    return {
      props: {
        initialData: news,
        initialPagination: {
          totalCount: totalItems,
          currentPage,
          pageSize,
          totalPages,
        },
        initialFilters,
        initialCategory: category ?? null,
      },
    }
  } catch (error) {
    console.error('[SSR News] Error fetching news:', error)

    return {
      props: {
        initialData: [],
        initialPagination: {
          totalCount: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
        },
        initialFilters: {},
      },
    }
  }
}

export default NewsPage
