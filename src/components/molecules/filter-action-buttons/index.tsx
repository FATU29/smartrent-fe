import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'

export interface FilterActionButtonsProps {
  onReset: () => void
  onApply: () => void
  onBack?: () => void
  applyDisabled?: boolean
}

export const FilterActionButtons: React.FC<FilterActionButtonsProps> = ({
  onReset,
  onApply,
  onBack,
  applyDisabled = false,
}) => {
  const t = useTranslations('seller.listingManagement.filter')

  return (
    <div className=' flex gap-4'>
      <Button
        type='button'
        variant='outline'
        onClick={onBack || onReset}
        className='rounded-full flex-1 text-base sm:text-sm font-medium'
      >
        {onBack ? t('back') : t('reset')}
      </Button>
      <Button
        type='button'
        onClick={onApply}
        className='rounded-full flex-1 text-base sm:text-sm font-medium'
        disabled={applyDisabled}
      >
        {t('apply')}
      </Button>
    </div>
  )
}
