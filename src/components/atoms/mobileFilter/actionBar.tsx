import React from 'react'
import { Button } from '@/components/atoms/button'
import { useTranslations } from 'next-intl'

// MobileFilterActionBar
// Sticky footer with Reset & Apply buttons. The parent decides disabled state & logic.
// Intentionally minimal to encourage reusability across different filter stacks.
interface MobileFilterActionBarProps {
  onReset: () => void
  onApply: () => void
  applyDisabled?: boolean
}

const MobileFilterActionBar: React.FC<MobileFilterActionBarProps> = ({
  onReset,
  onApply,
  applyDisabled,
}) => {
  const t = useTranslations('residentialFilter.actions')
  return (
    <div className='flex gap-3 p-4 border-t bg-background'>
      <Button
        variant='outline'
        className='flex-1'
        type='button'
        onClick={onReset}
      >
        {t('reset')}
      </Button>
      <Button
        className='flex-1'
        type='button'
        onClick={onApply}
        disabled={applyDisabled}
      >
        {t('apply')}
      </Button>
    </div>
  )
}

export default MobileFilterActionBar
