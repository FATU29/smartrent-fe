import React, { useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { cn } from '@/lib/utils'

export interface CascadeOption {
  id: string
  label: string
}

interface CascadeSelectFieldProps {
  label: string
  placeholder: string
  value?: string
  disabled?: boolean
  options: CascadeOption[]
  onChange: (value: string) => void
  searchable?: boolean
  className?: string
}

const CascadeSelectField: React.FC<CascadeSelectFieldProps> = ({
  label,
  placeholder,
  value,
  disabled,
  options,
  onChange,
  searchable = false,
  className,
}) => {
  const [keyword, setKeyword] = useState('')
  const filtered = useMemo(
    () =>
      !searchable || !keyword
        ? options
        : options.filter((o) =>
            o.label.toLowerCase().includes(keyword.toLowerCase()),
          ),
    [keyword, options, searchable],
  )

  const CLEAR_VALUE = '__clear__'

  return (
    <div className={cn('space-y-1', className)}>
      <div className='text-sm font-medium'>{label}</div>
      <Select
        value={value || undefined}
        onValueChange={(v) => {
          if (v === CLEAR_VALUE) onChange('')
          else onChange(v)
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            'w-full h-12 justify-between rounded-lg bg-white dark:bg-muted text-left',
            disabled && 'bg-muted/40 opacity-70 cursor-not-allowed',
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className='max-h-72'>
          {searchable && (
            <div className='p-2 sticky top-0 bg-popover z-10'>
              <input
                className='w-full text-sm px-2 py-1 border rounded-md bg-background'
                placeholder={placeholder}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          )}
          {/* Không render option placeholder */}
          {filtered.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default CascadeSelectField
