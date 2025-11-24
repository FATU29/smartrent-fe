import React from 'react'
import { useListContext } from './useListContext'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'

export interface ListLoadMoreProps {
  className?: string
  fullWidth?: boolean
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  labelIdleKey?: string
  labelLoadingKey?: string
  onAfterLoad?: () => void | Promise<void>
}

const ListLoadMore: React.FC<ListLoadMoreProps> = ({
  className,
  fullWidth = false,
  variant = 'default',
  size = 'default',
  labelIdleKey = 'common.loadMore',
  labelLoadingKey = 'common.loading',
  onAfterLoad,
}) => {
  const { pagination, isLoading, loadMore } = useListContext()
  const t = useTranslations()

  const { currentPage, totalPages } = pagination

  // Hide when on last page
  if (currentPage >= totalPages) return null

  const handleClick = async () => {
    await loadMore()
    if (onAfterLoad) await onAfterLoad()
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={fullWidth ? `w-full ${className || ''}` : className}
    >
      {isLoading ? t(labelLoadingKey) : t(labelIdleKey)}
    </Button>
  )
}

export default ListLoadMore
