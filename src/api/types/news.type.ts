/**
 * News & Blog Types
 * Based on the News API documentation
 * @module api/types/news
 */

// ============= ENUMS =============

export enum NewsCategory {
  NEWS = 'NEWS',
  BLOG = 'BLOG',
  MARKET_TREND = 'MARKET_TREND',
  GUIDE = 'GUIDE',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export enum NewsStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// ============= INTERFACES =============

/**
 * News item for list display (summary view)
 */
export interface NewsItem {
  newsId: number
  title: string
  slug: string
  summary: string
  category: NewsCategory
  tags: string[]
  thumbnailUrl: string
  publishedAt: string
  authorName: string
  viewCount: number
}

/**
 * Full news detail including content and metadata
 */
export interface NewsDetail extends NewsItem {
  content: string
  status: NewsStatus
  authorId: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  updatedAt: string
  relatedNews: NewsItem[]
}

// ============= REQUEST TYPES =============

/**
 * Request params for fetching news list
 */
export interface NewsListRequest {
  page?: number
  size?: number
  category?: NewsCategory | string
  tag?: string
  keyword?: string
}

/**
 * Request body for creating a news post (Admin)
 */
export interface NewsCreateRequest {
  title: string
  summary: string
  content: string
  category: NewsCategory | string
  tags?: string
  thumbnailUrl?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
}

/**
 * Request body for updating a news post (Admin)
 */
export interface NewsUpdateRequest {
  title?: string
  summary?: string
  content?: string
  category?: NewsCategory | string
  tags?: string
  thumbnailUrl?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
}

// ============= RESPONSE TYPES =============

/**
 * Paginated news list response
 */
export interface NewsListResponse {
  news: NewsItem[]
  totalItems: number
  currentPage: number
  pageSize: number
  totalPages: number
}

/**
 * News filter request for context/state management
 */
export interface NewsFilterRequest {
  page?: number
  size?: number
  category?: NewsCategory | string
  tag?: string
  keyword?: string
}

/**
 * Default filter values
 */
export const DEFAULT_NEWS_FILTERS: NewsFilterRequest = {
  page: 1,
  size: 20,
  category: undefined,
  tag: undefined,
  keyword: undefined,
}

/**
 * News pagination info
 */
export interface NewsPagination {
  totalItems: number
  currentPage: number
  pageSize: number
  totalPages: number
}

export const DEFAULT_NEWS_PAGINATION: NewsPagination = {
  totalItems: 0,
  currentPage: 1,
  pageSize: 20,
  totalPages: 0,
}
