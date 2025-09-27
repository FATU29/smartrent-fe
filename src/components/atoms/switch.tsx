import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: 'sm' | 'md'
}

export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onCheckedChange,
  size = 'md',
  className,
  disabled,
  ...props
}) => {
  const handleClick = () => {
    if (disabled) return
    onCheckedChange?.(!checked)
  }

  const sizes = {
    sm: 'w-8 h-4',
    md: 'w-10 h-5',
  }
  const knobSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  }

  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-muted',
        sizes[size],
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none inline-block transform rounded-full bg-background shadow ring-0 transition-transform',
          checked ? 'translate-x-full' : 'translate-x-0',
          knobSizes[size],
        )}
      />
    </button>
  )
}

export default Switch
