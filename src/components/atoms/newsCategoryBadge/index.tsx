import React from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/atoms/badge'
import { NewsCategory } from '@/api/types/news.type'

interface NewsCategoryBadgeProps {
  category: NewsCategory | string
  className?: string
}

const getCategoryConfig = (
  cat: NewsCategory | string,
  tCategories: (key: string) => string,
) => {
  const configs: Record<string, { label: string; className: string }> = {
    NEWS: {
      label: tCategories('news'),
      className: 'bg-blue-500 text-white border-blue-500',
    },
    BLOG: {
      label: tCategories('blog'),
      className: 'bg-violet-500 text-white border-violet-500',
    },
    MARKET_TREND: {
      label: tCategories('marketTrend'),
      className: 'bg-amber-500 text-white border-amber-500',
    },
    GUIDE: {
      label: tCategories('guide'),
      className: 'bg-emerald-500 text-white border-emerald-500',
    },
    ANNOUNCEMENT: {
      label: tCategories('announcement'),
      className: 'bg-red-500 text-white border-red-500',
    },
  }
  return configs[cat] || configs.NEWS
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

export { getCategoryConfig }
export default NewsCategoryBadge
