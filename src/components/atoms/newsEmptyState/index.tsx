import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Newspaper } from 'lucide-react'

interface NewsEmptyStateProps {
  className?: string
}

const NewsEmptyState: React.FC<NewsEmptyStateProps> = ({ className }) => {
  const t = useTranslations('newsPage')

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 text-center ${className || ''}`}
    >
      <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
        <Newspaper className='w-8 h-8 text-muted-foreground' />
      </div>
      <Typography variant='h3' className='mb-2'>
        {t('noNews')}
      </Typography>
      <Typography variant='p' className='text-muted-foreground max-w-md'>
        {t('noNewsDescription')}
      </Typography>
    </div>
  )
}

export default NewsEmptyState
