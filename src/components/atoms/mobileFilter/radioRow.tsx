import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// RadioRow
// Generic full‑width interactive row behaving like a radio option.
// Visual selection indicated by colored CheckCircle2 icon.
// 'dense' variant reduces height for grid layouts.
interface RadioRowProps {
  label: string
  selected?: boolean
  onClick: () => void
  iconLeft?: React.ReactNode
  dense?: boolean
}

const RadioRow: React.FC<RadioRowProps> = ({
  label,
  selected,
  onClick,
  iconLeft,
  dense = false,
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 text-left px-4',
        dense ? 'h-10' : 'h-12',
        'hover:bg-muted/40 transition-colors',
      )}
    >
      {iconLeft && <span className='shrink-0'>{iconLeft}</span>}
      <span className='flex-1 text-sm'>{label}</span>
      <span className='shrink-0'>
        <CheckCircle2
          className={cn(
            'h-5 w-5 transition-colors',
            selected ? 'text-destructive' : 'text-muted-foreground/30',
          )}
        />
      </span>
    </button>
  )
}

export default RadioRow
