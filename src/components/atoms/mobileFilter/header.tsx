import React from 'react'
import { Button } from '@/components/atoms/button'
import { ArrowLeft, X } from 'lucide-react'

// MobileFilterHeader
// Lightweight top bar used inside the full screen mobile filter dialog.
// Shows optional back button (navigates to main view) and mandatory close button.
// Keep this component purely presentational – business logic handled by parent.
interface MobileFilterHeaderProps {
  title: string
  onClose: () => void
  onBack?: () => void
  showBack?: boolean
}

const MobileFilterHeader: React.FC<MobileFilterHeaderProps> = ({
  title,
  onClose,
  onBack,
  showBack = false,
}) => {
  return (
    <div className='p-4 border-b flex items-center justify-between gap-2'>
      <div className='w-8'>
        {showBack && (
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0'
            onClick={onBack}
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
        )}
      </div>
      <div className='flex-1 text-center font-medium'>{title}</div>
      <div className='w-8 flex justify-end'>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 w-8 p-0'
          onClick={onClose}
        >
          <X className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}

export default MobileFilterHeader
