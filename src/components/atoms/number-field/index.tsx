import React, { useState } from 'react'
import { cn } from '@/lib/utils'

export interface NumberFieldProps {
  label?: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  suffix?: string
  className?: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  required?: boolean
  compact?: boolean
  error?: string
}

export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  className,
  min = 0,
  max,
  step = 1,
  disabled,
  required,
  compact,
  error,
}) => {
  const [touched, setTouched] = useState(false)
  const invalid = (touched && value < (min ?? 0)) || !!error

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.,-]/g, '')
    if (raw === '') {
      onChange(0)
      return
    }
    const numeric = Number.parseFloat(raw.replace(',', '.'))
    if (Number.isNaN(numeric)) return
    let next = numeric
    if (min !== undefined && next < min) next = min
    if (max !== undefined && next > max) next = max
    onChange(next)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
          {label}
          {required && <span className='text-destructive ml-1'>*</span>}
        </label>
      )}
      <div className='relative'>
        <input
          type='text'
          inputMode='decimal'
          className={cn(
            'w-full h-12 px-4 pr-10 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
            (invalid || error) &&
              'border-destructive dark:border-destructive focus:border-destructive focus:ring-destructive/50',
            disabled && 'opacity-60 cursor-not-allowed',
            compact && 'h-10 text-sm',
          )}
          placeholder={placeholder}
          value={value === 0 ? '' : value}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          disabled={disabled}
          step={step}
        />
        {suffix && (
          <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400'>
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className='text-xs text-destructive' role='alert'>
          {error}
        </p>
      )}
      {invalid && !error && (
        <p className='text-xs text-destructive'>Min {min}</p>
      )}
    </div>
  )
}

export default NumberField
