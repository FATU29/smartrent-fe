export type OpenGraphType =
  | 'website'
  | 'article'
  | 'profile'
  | 'product'
  | 'video.other'

export type OpenGraphImage = {
  url: string
  width?: number
  height?: number
  alt?: string
}

export interface SeoProps {
  title?: string
  description?: string
  canonical?: string
  noindex?: boolean
  openGraph?: {
    type?: OpenGraphType
    title?: string
    description?: string
    url?: string
    images?: OpenGraphImage[]
    siteName?: string
  }
  twitter?: {
    card?: 'summary' | 'summary_large_image'
    site?: string
    creator?: string
  }
}
