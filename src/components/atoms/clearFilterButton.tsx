import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from './button'

/**
 * ClearFilterButton
 * - show: whether to render the button (default: false, so homepage never shows it unless explicitly set)
 * - onClick: handler to clear filters
 * - className: optional styling
 */
interface ClearFilterButtonProps {
  onClick: () => void
  show?: boolean // default false for homepage, set true where needed
  className?: string
}

const ClearFilterButton: React.FC<ClearFilterButtonProps> = ({
  onClick,
  show = false,
  className = '',
}) => {
  const t = useTranslations('common')
  if (!show) return null
  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      onClick={onClick}
      className={className}
    >
      {t('clearFilters', { default: 'Clear Filters' })}
    </Button>
  )
}

export default ClearFilterButton
