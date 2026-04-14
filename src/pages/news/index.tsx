import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
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

type NewsListUIFilters = ListingFilterRequest & {
  tag?: string
  _t?: number
}

type NewsPageClientInit = {
  initialFilters: Partial<NewsListUIFilters>
  initialPagination: Pagination
  initialCategory?: string
  initialTag?: string
}

const DEFAULT_NEWS_PAGE = 1
const DEFAULT_NEWS_SIZE = 10

const parseQueryString = (value: unknown): string | undefined => {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') {
    return undefined
  }

  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const parsePositiveNumber = (value: unknown, fallback: number): number => {
  const parsed = Number.parseInt(parseQueryString(value) || '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const parseNewsClientInit = (
  query: Record<string, unknown>,
): NewsPageClientInit => {
  // Always start from page 1 — load-more is client-side accumulation,
  // page number in URL is not a valid entry point
  const size = parsePositiveNumber(query.size, DEFAULT_NEWS_SIZE)
  const category = parseQueryString(query.category)
  const keyword = parseQueryString(query.keyword)
  const tag = parseQueryString(query.tag)

  return {
    initialFilters: {
      page: DEFAULT_NEWS_PAGE,
      size,
      ...(keyword ? { keyword } : {}),
      ...(tag ? { tag } : {}),
    },
    initialPagination: {
      totalCount: 0,
      currentPage: DEFAULT_NEWS_PAGE,
      pageSize: size,
      totalPages: 0,
    },
    initialCategory: category,
    initialTag: tag,
  }
}

const NewsPage: NextPageWithLayout = () => {
  const t = useTranslations('newsPage')
  const router = useRouter()
  const lastPushedFiltersRef = useRef<string>('')
  const [clientInit, setClientInit] = useState<NewsPageClientInit | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedTag, setSelectedTag] = useState<string | undefined>()
  const selectedCategoryRef = useRef(selectedCategory)
  const selectedTagRef = useRef(selectedTag)
  selectedCategoryRef.current = selectedCategory
  selectedTagRef.current = selectedTag

  useEffect(() => {
    if (!router.isReady || clientInit) {
      return
    }

    const initialState = parseNewsClientInit(router.query)
    setClientInit(initialState)
    setSelectedCategory(initialState.initialCategory)
    setSelectedTag(initialState.initialTag)
  }, [router.isReady, router.query, clientInit])

  const pushFiltersToQuery = useCallback(
    (filters: NewsListUIFilters, category?: string, tag?: string) => {
      const filtersKey = JSON.stringify({ ...filters, category, tag })
      if (lastPushedFiltersRef.current === filtersKey) {
        return
      }
      lastPushedFiltersRef.current = filtersKey

      const queryParams: Record<string, string | null> = {}
      // Do NOT push page number — load-more accumulates items client-side,
      // putting ?page=N in the URL causes re-init on refresh at page N with no prior pages
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
        { shallow: true, scroll: false },
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
    if (!router.isReady || !clientInit) return

    const nextTag =
      typeof router.query.tag === 'string' && router.query.tag.trim().length > 0
        ? router.query.tag
        : undefined

    if (selectedTagRef.current === nextTag) return

    handleTagChange(nextTag)
  }, [router.isReady, router.query.tag, handleTagChange, clientInit])

  useEffect(() => {
    if (!router.isReady || !clientInit) return

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
  }, [router.isReady, router.query.category, clientInit])

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

  if (!clientInit) {
    return (
      <>
        <SeoHead title={t('seoTitle')} description={t('seoDescription')} />
        <div className='container mx-auto py-6 px-4 md:px-0'>
          <div className='min-h-[240px]' aria-busy='true' />
        </div>
      </>
    )
  }

  return (
    <>
      <SeoHead title={t('seoTitle')} description={t('seoDescription')} />
      <div className='container mx-auto py-6 px-4 md:px-0'>
        <ListProvider<NewsItem>
          fetcher={fetcher}
          initialData={[]}
          initialFilters={clientInit.initialFilters}
          initialPagination={clientInit.initialPagination}
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

export default NewsPage
