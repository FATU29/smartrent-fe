import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectDropdownProps {
  // Basic props
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean

  // Options
  options: SelectOption[]

  // Styling
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string

  // Label and error
  label?: string | React.ReactNode
  error?: string
  helperText?: string

  // Icon
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'

  // Loading state
  loading?: boolean

  // Layout
  fullWidth?: boolean
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  value,
  onValueChange,
  placeholder = 'Select an option...',
  disabled = false,
  options = [],
  variant = 'default',
  size = 'md',
  className,
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = true,
}) => {
  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg',
  }

  const variantClasses = {
    default:
      'border-2 border-border bg-background hover:border-foreground/30 focus:outline-none focus-visible:outline-none',
    outline:
      'border-2 border-input bg-transparent hover:border-foreground/40 focus:outline-none focus-visible:outline-none',
    ghost:
      'border-0 bg-muted hover:bg-accent focus:outline-none focus-visible:outline-none',
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full', className)}>
      {/* Label */}
      {label && (
        <label
          className={cn(
            'text-sm font-semibold text-foreground',
            error && 'text-destructive',
          )}
        >
          {label}
        </label>
      )}

      {/* Select Container */}
      <div className='relative group'>
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className='absolute left-3 top-1/2 transform -translate-y-1/2 z-10'>
            <div
              className={cn(
                'text-muted-foreground group-focus-within:text-ring transition-colors',
                iconSizeClasses[size],
              )}
            >
              {icon}
            </div>
          </div>
        )}

        {/* Select Component */}
        <Select
          value={value}
          onValueChange={onValueChange}
          disabled={disabled || loading}
        >
          <SelectTrigger
            className={cn(
              'rounded-xl transition-all duration-200 shadow-sm py-5',
              sizeClasses[size],
              variantClasses[variant],
              icon && iconPosition === 'left' && 'pl-12 pr-5',
              icon && iconPosition === 'right' && 'pl-5 pr-12',
              loading && 'pr-12',
              error && 'border-destructive',
              disabled && 'opacity-50 cursor-not-allowed',
              loading && 'opacity-70 cursor-wait',
              fullWidth && 'w-full',
            )}
          >
            <SelectValue placeholder={placeholder || 'Select an option...'} />
            {loading && (
              <div className='absolute right-3 top-1/2 transform -translate-y-1/2 z-10'>
                <Loader2
                  className={cn(
                    'text-muted-foreground animate-spin',
                    iconSizeClasses[size],
                  )}
                />
              </div>
            )}
          </SelectTrigger>

          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className='cursor-pointer px-4 py-3'
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2 z-10'>
            <div
              className={cn(
                'text-muted-foreground group-focus-within:text-ring transition-colors',
                iconSizeClasses[size],
              )}
            >
              {icon}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text or Error */}
      {(error || helperText) && (
        <p
          className={cn(
            'text-xs',
            error ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
}

export default SelectDropdown
