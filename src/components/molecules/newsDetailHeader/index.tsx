import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import NewsCategoryBadge from '@/components/atoms/newsCategoryBadge'
import NewsMetaInfo from '@/components/atoms/newsMetaInfo'
import { NewsDetail } from '@/api/types/news.type'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface NewsDetailHeaderProps {
  news: NewsDetail
}

const NewsDetailHeader: React.FC<NewsDetailHeaderProps> = ({ news }) => {
  const t = useTranslations('newsPage')

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.summary,
          url: globalThis.location.href,
        })
        toast.success(t('shareSuccess'))
      } catch {
        // Share cancelled by user
      }
    } else {
      try {
        await navigator.clipboard.writeText(globalThis.location.href)
        toast.success(t('linkCopied'))
      } catch {
        toast.error(t('shareFailed'))
      }
    }
  }

  return (
    <header className='mb-10'>
      {/* Category Badge */}
      <div className='mb-5'>
        <NewsCategoryBadge
          category={news.category}
          className='text-xs px-3 py-1'
        />
      </div>

      {/* Title */}
      <Typography
        variant='h1'
        className='text-2xl md:text-4xl font-extrabold mb-5 leading-tight tracking-tight'
      >
        {news.title}
      </Typography>

      {/* Summary */}
      <Typography
        variant='p'
        className='text-base md:text-lg text-muted-foreground mb-6 leading-relaxed'
      >
        {news.summary}
      </Typography>

      {/* Meta Info + Share */}
      <div className='flex flex-wrap items-center gap-4 py-4 border-y border-border/60'>
        <NewsMetaInfo
          authorName={news.authorName}
          publishedAt={news.publishedAt}
          viewCount={news.viewCount}
        />

        {/* Share Button */}
        <div className='ml-auto flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleShare}
            className='rounded-full gap-1.5 hover:bg-primary hover:text-white transition-colors'
          >
            <Share2 className='w-4 h-4' />
            {t('share')}
          </Button>
        </div>
      </div>
    </header>
  )
}

export default NewsDetailHeader
