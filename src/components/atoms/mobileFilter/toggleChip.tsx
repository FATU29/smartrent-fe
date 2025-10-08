import React from 'react'
import { cn } from '@/lib/utils'

// ToggleChip
// Pill style on/off control used for multi-select amenity and boolean flags.
// Keeps internal state stateless; parent drives 'active'.
interface ToggleChipProps {
  label: string
  active?: boolean
  onClick: () => void
}

const ToggleChip: React.FC<ToggleChipProps> = ({ label, active, onClick }) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'px-3 h-9 rounded-full text-sm flex items-center border',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-muted text-foreground/80 hover:text-foreground hover:bg-muted/90 border-transparent',
      )}
    >
      {label}
    </button>
  )
}

export default ToggleChip
