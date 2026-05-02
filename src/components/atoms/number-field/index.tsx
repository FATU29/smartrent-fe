import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { NumericFormat } from 'react-number-format'

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
  decimals?: number
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
  decimals = 0,
  disabled,
  required,
  compact,
  error,
}) => {
  const tCommon = useTranslations('common')
  const [touched, setTouched] = useState(false)
  const isBelowMin = touched && value < (min ?? 0)
  const invalid = isBelowMin || !!error

  const handleValueChange = (floatValue?: number) => {
    let next = floatValue ?? 0
    if (min !== undefined && next < min) next = min
    if (max !== undefined && next > max) next = max
    onChange(next)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className='text-sm font-semibold text-foreground'>
          {label}
          {required && <span className='text-destructive ml-1'>*</span>}
        </label>
      )}
      <div className='relative'>
        <NumericFormat
          value={value === 0 ? undefined : value}
          onValueChange={(v) => handleValueChange(v.floatValue)}
          thousandSeparator='.'
          decimalSeparator=','
          allowNegative={false}
          decimalScale={decimals}
          allowLeadingZeros={false}
          inputMode='numeric'
          placeholder={placeholder}
          // Mutually-exclusive branches avoid the focus-border conflict between
          // `focus:border-ring` (default) and `focus:border-destructive` (error).
          // Stacking both into the same className relied on tailwind-merge to
          // pick a winner, which didn't behave consistently for custom theme
          // colors under the `focus:` modifier.
          className={cn(
            'w-full h-12 px-4 pr-10 border-2 rounded-xl bg-background text-foreground transition-all duration-200 shadow-sm focus:ring-2',
            invalid
              ? 'border-destructive focus:border-destructive focus:ring-destructive/40'
              : 'border-border hover:border-foreground/30 focus:border-ring focus:ring-ring/50',
            disabled && 'opacity-60 cursor-not-allowed',
            compact && 'h-10 text-sm',
          )}
          disabled={disabled}
          onBlur={() => setTouched(true)}
        />
        {suffix && (
          <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground'>
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className='text-xs text-destructive' role='alert'>
          {error}
        </p>
      )}
      {isBelowMin && !error && (
        <p className='text-xs text-destructive' role='alert'>
          {tCommon('validation.min', { min })}
        </p>
      )}
    </div>
  )
}

export default NumberField
