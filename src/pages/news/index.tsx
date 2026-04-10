import React, { useCallback, useEffect, useRef, useState } from 'react'
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
  initialTag?: string | null
}

type NewsListUIFilters = ListingFilterRequest & {
  tag?: string
  _t?: number
}

const NewsPage: NextPageWithLayout<NewsPageProps> = ({
  initialData,
  initialPagination,
  initialFilters,
  initialCategory,
  initialTag,
}) => {
  const t = useTranslations('newsPage')
  const router = useRouter()
  const lastPushedFiltersRef = useRef<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    initialCategory ?? undefined,
  )
  const [selectedTag, setSelectedTag] = useState<string | undefined>(
    initialTag ?? undefined,
  )
  const selectedCategoryRef = useRef(selectedCategory)
  const selectedTagRef = useRef(selectedTag)
  selectedCategoryRef.current = selectedCategory
  selectedTagRef.current = selectedTag

  const pushFiltersToQuery = useCallback(
    (filters: NewsListUIFilters, category?: string, tag?: string) => {
      const filtersKey = JSON.stringify({ ...filters, category, tag })
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
      if (tag) {
        queryParams.tag = tag
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
      filters: NewsListUIFilters,
    ): Promise<ApiResponse<ListingSearchResponse<NewsItem>>> => {
      const category = selectedCategoryRef.current
      const tag = selectedTagRef.current

      // Map ListingFilterRequest to NewsFilterRequest
      const newsFilters: NewsFilterRequest = {
        page: filters.page || 1,
        size: filters.size || 20,
        keyword: filters.keyword || undefined,
        category: category || undefined,
        tag: tag || undefined,
      }

      pushFiltersToQuery(filters, category, tag)

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

  const handleCategoryChange = useCallback((category: string | undefined) => {
    setSelectedCategory(category)
    selectedCategoryRef.current = category

    // Trigger client-side re-fetch via ListContext
    // Use _t to force a new filtersKey even if page was already 1
    if (listActionsRef.current) {
      listActionsRef.current.updateFilters({
        page: 1,
        _t: Date.now(),
      } as Partial<NewsListUIFilters>)
    }
  }, [])

  const handleTagClear = useCallback(() => {
    setSelectedTag(undefined)
    selectedTagRef.current = undefined

    if (listActionsRef.current) {
      listActionsRef.current.updateFilters({
        tag: undefined,
        page: 1,
        _t: Date.now(),
      } as Partial<NewsListUIFilters>)
    }
  }, [])

  const handleTagChange = useCallback((tag: string | undefined) => {
    setSelectedTag(tag)
    selectedTagRef.current = tag

    if (listActionsRef.current) {
      listActionsRef.current.updateFilters({
        tag,
        page: 1,
        _t: Date.now(),
      } as Partial<NewsListUIFilters>)
    }
  }, [])

  useEffect(() => {
    const nextTag =
      typeof router.query.tag === 'string' && router.query.tag.trim().length > 0
        ? router.query.tag
        : undefined

    if (selectedTagRef.current === nextTag) return

    handleTagChange(nextTag)
  }, [router.query.tag, handleTagChange])

  useEffect(() => {
    const nextCategory =
      typeof router.query.category === 'string' &&
      router.query.category.trim().length > 0
        ? router.query.category
        : undefined

    if (selectedCategoryRef.current === nextCategory) return

    setSelectedCategory(nextCategory)
    selectedCategoryRef.current = nextCategory

    if (listActionsRef.current) {
      listActionsRef.current.updateFilters({
        page: 1,
        _t: Date.now(),
      } as Partial<NewsListUIFilters>)
    }
  }, [router.query.category])

  // Capture ListContext actions so category change can trigger re-fetch
  const listActionsRef = useRef<{
    updateFilters: (f: Partial<NewsListUIFilters>) => void
  } | null>(null)

  const handleListReady = useCallback(
    (actions: { updateFilters: (f: Partial<NewsListUIFilters>) => void }) => {
      listActionsRef.current = actions

      if (selectedTagRef.current) {
        listActionsRef.current.updateFilters({
          tag: selectedTagRef.current,
        })
      }
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
            selectedTag={selectedTag}
            onTagClear={handleTagClear}
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

    const page = query.page ? Number.parseInt(query.page as string, 10) : 1
    const size = query.size ? Number.parseInt(query.size as string, 10) : 20
    const category = (query.category as string) || null
    const keyword = (query.keyword as string) || null
    const tag = (query.tag as string) || null

    const newsFilters: NewsFilterRequest = {
      page,
      size,
      ...(category ? { category } : {}),
      ...(tag ? { tag } : {}),
      ...(keyword ? { keyword } : {}),
    }

    const response = await NewsService.getList(newsFilters)

    const initialFilters: Partial<NewsListUIFilters> = {
      page,
      size,
      ...(tag ? { tag } : {}),
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
          initialTag: tag ?? null,
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
        initialTag: tag ?? null,
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
