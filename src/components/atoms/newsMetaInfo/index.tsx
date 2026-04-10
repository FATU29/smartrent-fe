import React from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, Eye, User } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { formatAuthorDisplayName } from '@/utils/news'

interface NewsMetaInfoProps {
  authorName?: string
  publishedAt: string | null
  viewCount: number
  className?: string
  variant?: 'default' | 'compact'
}

const formatDate = (dateString: string | null, fallback: string) => {
  if (!dateString) return fallback
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
  } catch {
    return fallback
  }
}

const formatRelativeDate = (dateString: string | null, fallback: string) => {
  if (!dateString) return fallback
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    )
    if (diffDays < 7) {
      return formatDistanceToNow(date, { addSuffix: true })
    }
    return format(date, 'dd/MM/yyyy')
  } catch {
    return fallback
  }
}

const NewsMetaInfo: React.FC<NewsMetaInfoProps> = ({
  authorName,
  publishedAt,
  viewCount,
  className,
  variant = 'default',
}) => {
  const t = useTranslations('newsPage')
  const displayAuthor = formatAuthorDisplayName(authorName, t('authorFallback'))
  const displayDate =
    variant === 'compact'
      ? formatRelativeDate(publishedAt, t('dateUnavailable'))
      : formatDate(publishedAt, t('dateUnavailable'))

  return (
    <div
      className={`flex flex-wrap items-center gap-2 text-sm text-muted-foreground ${className || ''}`}
    >
      <>
        <span className='inline-flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-full'>
          <div className='w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center'>
            <User className='w-3 h-3 text-primary' />
          </div>
          <span className='font-medium text-foreground'>{displayAuthor}</span>
        </span>
        <span className='text-muted-foreground/40'>·</span>
      </>
      <span className='inline-flex items-center gap-1.5'>
        <Calendar className='w-3.5 h-3.5' />
        {displayDate}
      </span>
      <span className='text-muted-foreground/40'>·</span>
      <span className='inline-flex items-center gap-1.5'>
        <Eye className='w-3.5 h-3.5' />
        {viewCount.toLocaleString()} {t('views')}
      </span>
    </div>
  )
}

export default NewsMetaInfo
