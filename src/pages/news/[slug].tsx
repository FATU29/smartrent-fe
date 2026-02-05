import React from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import NewsDetailTemplate from '@/components/templates/newsDetailTemplate'
import { NewsService } from '@/api/services/news.service'
import { NewsDetail } from '@/api/types/news.type'

interface NewsDetailPageProps {
  news: NewsDetail | null
  error?: string
}

const NewsDetailPage: NextPageWithLayout<NewsDetailPageProps> = ({
  news,
  error,
}) => {
  return (
    <>
      {news && (
        <Head>
          <title>{news.metaTitle || news.title}</title>
          <meta
            name='description'
            content={news.metaDescription || news.summary}
          />
          <meta
            name='keywords'
            content={news.metaKeywords || news.tags?.join(', ')}
          />

          {/* Open Graph tags */}
          <meta property='og:title' content={news.title} />
          <meta property='og:description' content={news.summary} />
          <meta property='og:image' content={news.thumbnailUrl} />
          <meta property='og:type' content='article' />
          <meta property='article:published_time' content={news.publishedAt} />
          <meta property='article:author' content={news.authorName} />

          {/* Twitter Card tags */}
          <meta name='twitter:card' content='summary_large_image' />
          <meta name='twitter:title' content={news.title} />
          <meta name='twitter:description' content={news.summary} />
          <meta name='twitter:image' content={news.thumbnailUrl} />
        </Head>
      )}

      <NewsDetailTemplate news={news} error={error} />
    </>
  )
}

NewsDetailPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout activeItem='news'>{page}</MainLayout>
}

export const getServerSideProps: GetServerSideProps<
  NewsDetailPageProps
> = async (context) => {
  const { slug } = context.params as { slug: string }

  try {
    const response = await NewsService.getBySlug(slug)

    if (!response.success || !response.data) {
      return {
        props: {
          news: null,
          error: response.message || 'News not found',
        },
      }
    }

    return {
      props: {
        news: response.data,
      },
    }
  } catch (error) {
    console.error('[SSR News Detail] Error:', error)

    return {
      props: {
        news: null,
        error: 'Failed to load news',
      },
    }
  }
}

export default NewsDetailPage
