import React from 'react'
import { Button } from '@/components/atoms/button'

export interface AddChipButtonProps {
  label: string
  disabled?: boolean
  onClick?: () => void
}

export const AddChipButton: React.FC<AddChipButtonProps> = ({
  label,
  disabled,
  onClick,
}) => (
  <Button
    type='button'
    variant='outline'
    size='sm'
    disabled={disabled}
    onClick={onClick}
    className='h-12 rounded-full px-6 font-medium flex items-center border-dashed'
  >
    {label}
  </Button>
)
