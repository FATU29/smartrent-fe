import React from 'react'
import { Button } from '@/components/atoms/button'
import { X } from 'lucide-react'

// MobileFilterHeader
// Lightweight top bar used inside the full screen mobile filter dialog.
// Shows optional back button (navigates to main view) and mandatory close button.
// Keep this component purely presentational – business logic handled by parent.
interface MobileFilterHeaderProps {
  title: string
  onClose: () => void
}

const MobileFilterHeader: React.FC<MobileFilterHeaderProps> = ({
  title,
  onClose,
}) => {
  return (
    <div className='p-4 border-b flex items-center justify-between gap-2'>
      <div className='flex-1 text-center font-medium'>{title}</div>
      <div className='flex justify-end'>
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
