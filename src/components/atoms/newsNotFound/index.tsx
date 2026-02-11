import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { PUBLIC_ROUTES } from '@/constants/route'
import { ArrowLeft, Newspaper } from 'lucide-react'

const NewsNotFound: React.FC = () => {
  const t = useTranslations('newsPage')

  return (
    <div className='container mx-auto px-4 py-24 text-center max-w-lg'>
      <div className='w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6'>
        <Newspaper className='w-10 h-10 text-muted-foreground' />
      </div>
      <Typography variant='h1' className='text-2xl font-bold mb-3'>
        {t('notFound')}
      </Typography>
      <Typography
        variant='p'
        className='text-muted-foreground mb-8 leading-relaxed'
      >
        {t('notFoundDescription')}
      </Typography>
      <Button asChild size='lg'>
        <Link href={PUBLIC_ROUTES.NEWS}>
          <ArrowLeft className='w-4 h-4 mr-2' />
          {t('backToNews')}
        </Link>
      </Button>
    </div>
  )
}

export default NewsNotFound
