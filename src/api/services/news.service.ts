/**
 * News Service
 * Handles all news-related operations including public and admin endpoints
 * @module api/services/news
 */

import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import type { AxiosInstance } from 'axios'
import type {
  NewsDetail,
  NewsItem,
  NewsListRequest,
  NewsListResponse,
  NewsCreateRequest,
  NewsUpdateRequest,
} from '../types/news.type'

// ============= NEWS SERVICE CLASS =============

export class NewsService {
  // ============= PUBLIC ENDPOINTS =============

  /**
   * Get paginated list of published news
   * @param params - Filter and pagination parameters
   */
  static async getList(
    params?: NewsListRequest,
  ): Promise<ApiResponse<NewsListResponse>> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.size) queryParams.append('size', params.size.toString())
      if (params?.category) queryParams.append('category', params.category)
      if (params?.tag) queryParams.append('tag', params.tag)
      if (params?.keyword) queryParams.append('keyword', params.keyword)

      const queryString = queryParams.toString()
      const url = queryString
        ? `${PATHS.NEWS.LIST}?${queryString}`
        : PATHS.NEWS.LIST

      const response = await apiRequest<NewsListResponse>({
        method: 'GET',
        url,
      })

      return response
    } catch (error) {
      console.error('Error fetching news list:', error)
      return {
        code: '500',
        message: String(error),
        data: {
          news: [],
          totalItems: 0,
          currentPage: 1,
          pageSize: 20,
          totalPages: 0,
        },
        success: false,
      }
    }
  }

  /**
   * Get news detail by slug
   * @param slug - URL-friendly slug
   */
  static async getBySlug(
    slug: string,
  ): Promise<ApiResponse<NewsDetail | null>> {
    try {
      const url = PATHS.NEWS.DETAIL.replace(':slug', encodeURIComponent(slug))
      const response = await apiRequest<NewsDetail>({
        method: 'GET',
        url,
      })

      if (!response.data || response.code !== '999999') {
        return { ...response, data: null }
      }

      return response
    } catch (error) {
      console.error(`Error fetching news ${slug}:`, error)
      return {
        code: '500',
        message: String(error),
        data: null,
        success: false,
      }
    }
  }

  /**
   * Get the N newest published news articles
   * @param limit - Number of news articles to return (1-50, default: 10)
   * @param instance - Optional axios instance for server-side rendering
   */
  static async getNewest(
    limit: number = 10,
    instance?: AxiosInstance,
  ): Promise<ApiResponse<NewsItem[]>> {
    try {
      const queryParams = new URLSearchParams()
      if (limit) {
        queryParams.append('limit', limit.toString())
      }

      const queryString = queryParams.toString()
      const url = queryString
        ? `${PATHS.NEWS.NEWEST}?${queryString}`
        : PATHS.NEWS.NEWEST

      const response = await apiRequest<NewsItem[]>(
        {
          method: 'GET',
          url,
        },
        instance,
      )

      return response
    } catch (error) {
      console.error('Error fetching newest news:', error)
      return {
        code: '500',
        message: String(error),
        data: [],
        success: false,
      }
    }
  }

  // ============= ADMIN ENDPOINTS =============

  /**
   * Get all news for admin view
   * @param params - Filter and pagination parameters
   */
  static async adminGetList(
    params?: NewsListRequest,
  ): Promise<ApiResponse<NewsListResponse>> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.size) queryParams.append('size', params.size.toString())
      if (params?.category) queryParams.append('category', params.category)
      if (params?.tag) queryParams.append('tag', params.tag)
      if (params?.keyword) queryParams.append('keyword', params.keyword)

      const queryString = queryParams.toString()
      const url = queryString
        ? `${PATHS.ADMIN_NEWS.LIST}?${queryString}`
        : PATHS.ADMIN_NEWS.LIST

      const response = await apiRequest<NewsListResponse>({
        method: 'GET',
        url,
      })

      return response
    } catch (error) {
      console.error('Error fetching admin news list:', error)
      return {
        code: '500',
        message: String(error),
        data: {
          news: [],
          totalItems: 0,
          currentPage: 1,
          pageSize: 20,
          totalPages: 0,
        },
        success: false,
      }
    }
  }

  /**
   * Get news by ID for admin view
   * @param newsId - News ID
   */
  static async adminGetById(
    newsId: number,
  ): Promise<ApiResponse<NewsDetail | null>> {
    try {
      const url = PATHS.ADMIN_NEWS.DETAIL.replace(':newsId', newsId.toString())
      const response = await apiRequest<NewsDetail>({
        method: 'GET',
        url,
      })

      if (!response.data || response.code !== '999999') {
        return { ...response, data: null }
      }

      return response
    } catch (error) {
      console.error(`Error fetching admin news ${newsId}:`, error)
      return {
        code: '500',
        message: String(error),
        data: null,
        success: false,
      }
    }
  }

  /**
   * Create a new news post
   * @param data - News creation request
   */
  static async create(
    data: NewsCreateRequest,
  ): Promise<ApiResponse<NewsDetail | null>> {
    try {
      const response = await apiRequest<NewsDetail>({
        method: 'POST',
        url: PATHS.ADMIN_NEWS.CREATE,
        data,
      })

      return response
    } catch (error) {
      console.error('Error creating news:', error)
      return {
        code: '500',
        message: String(error),
        data: null,
        success: false,
      }
    }
  }

  /**
   * Update an existing news post
   * @param newsId - News ID
   * @param data - News update request
   */
  static async update(
    newsId: number,
    data: NewsUpdateRequest,
  ): Promise<ApiResponse<NewsDetail | null>> {
    try {
      const url = PATHS.ADMIN_NEWS.UPDATE.replace(':newsId', newsId.toString())
      const response = await apiRequest<NewsDetail>({
        method: 'PUT',
        url,
        data,
      })

      return response
    } catch (error) {
      console.error(`Error updating news ${newsId}:`, error)
      return {
        code: '500',
        message: String(error),
        data: null,
        success: false,
      }
    }
  }

  /**
   * Publish a news post
   * @param newsId - News ID
   */
  static async publish(
    newsId: number,
  ): Promise<ApiResponse<NewsDetail | null>> {
    try {
      const url = PATHS.ADMIN_NEWS.PUBLISH.replace(':newsId', newsId.toString())
      const response = await apiRequest<NewsDetail>({
        method: 'POST',
        url,
      })

      return response
    } catch (error) {
      console.error(`Error publishing news ${newsId}:`, error)
      return {
        code: '500',
        message: String(error),
        data: null,
        success: false,
      }
    }
  }

  /**
   * Unpublish a news post
   * @param newsId - News ID
   */
  static async unpublish(
    newsId: number,
  ): Promise<ApiResponse<NewsDetail | null>> {
    try {
      const url = PATHS.ADMIN_NEWS.UNPUBLISH.replace(
        ':newsId',
        newsId.toString(),
      )
      const response = await apiRequest<NewsDetail>({
        method: 'POST',
        url,
      })

      return response
    } catch (error) {
      console.error(`Error unpublishing news ${newsId}:`, error)
      return {
        code: '500',
        message: String(error),
        data: null,
        success: false,
      }
    }
  }

  /**
   * Archive a news post
   * @param newsId - News ID
   */
  static async archive(
    newsId: number,
  ): Promise<ApiResponse<NewsDetail | null>> {
    try {
      const url = PATHS.ADMIN_NEWS.ARCHIVE.replace(':newsId', newsId.toString())
      const response = await apiRequest<NewsDetail>({
        method: 'POST',
        url,
      })

      return response
    } catch (error) {
      console.error(`Error archiving news ${newsId}:`, error)
      return {
        code: '500',
        message: String(error),
        data: null,
        success: false,
      }
    }
  }

  /**
   * Delete a news post
   * @param newsId - News ID
   */
  static async delete(newsId: number): Promise<ApiResponse<null>> {
    try {
      const url = PATHS.ADMIN_NEWS.DELETE.replace(':newsId', newsId.toString())
      const response = await apiRequest<null>({
        method: 'DELETE',
        url,
      })

      return response
    } catch (error) {
      console.error(`Error deleting news ${newsId}:`, error)
      return {
        code: '500',
        message: String(error),
        data: null,
        success: false,
      }
    }
  }
}

// ============= STANDALONE FUNCTIONS =============

/**
 * Fetch news list (for use in getServerSideProps)
 */
export async function fetchNewsList(
  params?: NewsListRequest,
): Promise<ApiResponse<NewsListResponse>> {
  return NewsService.getList(params)
}

/**
 * Fetch news detail by slug (for use in getServerSideProps)
 */
export async function fetchNewsDetail(
  slug: string,
): Promise<ApiResponse<NewsDetail | null>> {
  return NewsService.getBySlug(slug)
}

/**
 * Fetch newest news (for use in getServerSideProps)
 */
export async function fetchNewestNews(
  limit: number = 10,
  instance?: AxiosInstance,
): Promise<ApiResponse<NewsItem[]>> {
  return NewsService.getNewest(limit, instance)
}
