import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import NewsNotFound from '@/components/atoms/newsNotFound'
import NewsDetailHeader from '@/components/molecules/newsDetailHeader'
import NewsDetailContent from '@/components/molecules/newsDetailContent'
import NewsTagList from '@/components/molecules/newsTagList'
import NewsRelatedSection from '@/components/molecules/newsRelatedSection'
import { NewsDetail } from '@/api/types/news.type'
import { PUBLIC_ROUTES } from '@/constants/route'
import { ArrowLeft } from 'lucide-react'

interface NewsDetailTemplateProps {
  news: NewsDetail | null
  error?: string
}

const NewsDetailTemplate: React.FC<NewsDetailTemplateProps> = ({
  news,
  error,
}) => {
  const t = useTranslations('newsPage')

  if (error || !news) {
    return <NewsNotFound />
  }

  return (
    <article className='container mx-auto px-4 py-8 max-w-4xl'>
      {/* Back Button */}
      <nav className='mb-8'>
        <Button
          variant='ghost'
          size='sm'
          asChild
          className='rounded-full gap-1.5 text-muted-foreground hover:text-foreground transition-colors -ml-2'
        >
          <Link href={PUBLIC_ROUTES.NEWS}>
            <ArrowLeft className='w-4 h-4' />
            {t('backToNews')}
          </Link>
        </Button>
      </nav>

      {/* Article Header */}
      <NewsDetailHeader news={news} />

      {/* Featured Image + Content */}
      <NewsDetailContent
        title={news.title}
        content={news.content}
        thumbnailUrl={news.thumbnailUrl}
      />

      {/* Tags */}
      {news.tags && news.tags.length > 0 && (
        <NewsTagList tags={news.tags} className='mb-10' />
      )}

      {/* Related News */}
      {news.relatedNews && news.relatedNews.length > 0 && (
        <NewsRelatedSection relatedNews={news.relatedNews} className='mb-10' />
      )}
    </article>
  )
}

export default NewsDetailTemplate
