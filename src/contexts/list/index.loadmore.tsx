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

/**
 * ListLoadMore - generic load-more button bound to List context.
 * Shows loading state and hides itself when there is no next page.
 */
const ListLoadMore: React.FC<ListLoadMoreProps> = ({
  className,
  fullWidth = false,
  variant = 'default',
  size = 'default',
  labelIdleKey = 'common.loadMore',
  labelLoadingKey = 'common.loading',
  onAfterLoad,
}) => {
  const { pagination, isLoading, handleLoadMore } = useListContext()
  const t = useTranslations()

  if (!pagination.hasNext) {
    return null
  }

  return (
    <Button
      onClick={async () => {
        await handleLoadMore()
        if (onAfterLoad) await onAfterLoad()
      }}
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
