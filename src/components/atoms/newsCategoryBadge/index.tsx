import React from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/atoms/badge'
import { NewsCategory } from '@/api/types/news.type'
import { getCategoryConfig } from '@/utils/news'

interface NewsCategoryBadgeProps {
  category: NewsCategory | string
  className?: string
}

const NewsCategoryBadge: React.FC<NewsCategoryBadgeProps> = ({
  category,
  className,
}) => {
  const tCategories = useTranslations('newsPage.categories')
  const config = getCategoryConfig(category, tCategories)

  return (
    <Badge
      variant='outline'
      className={`${config.className} ${className || ''}`}
    >
      {config.label}
    </Badge>
  )
}

export default NewsCategoryBadge
