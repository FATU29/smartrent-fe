import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/atoms/badge'
import { Tag } from 'lucide-react'
import { PUBLIC_ROUTES } from '@/constants/route'

interface NewsTagListProps {
  tags: string[]
  className?: string
}

const NewsTagList: React.FC<NewsTagListProps> = ({ tags, className }) => {
  if (!tags || tags.length === 0) return null

  return (
    <div className={`pt-6 border-t border-border/60 ${className || ''}`}>
      <div className='flex items-center gap-2 mb-3'>
        <Tag className='w-4 h-4 text-muted-foreground' />
        <span className='text-sm font-medium text-muted-foreground'>Tags</span>
      </div>
      <div className='flex flex-wrap gap-2'>
        {tags.map((tag, index) => (
          <Link
            key={index}
            href={`${PUBLIC_ROUTES.NEWS}?tag=${encodeURIComponent(tag)}`}
          >
            <Badge
              variant='secondary'
              className='cursor-pointer px-3 py-1 text-sm rounded-full hover:bg-primary/10 hover:text-primary transition-colors'
            >
              #{tag}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default NewsTagList
