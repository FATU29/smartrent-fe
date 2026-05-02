import * as React from 'react'
import { ChevronDown, X } from 'lucide-react'

import { Button } from '@/components/atoms/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/atoms/popover'
import { cn } from '@/lib/utils'

interface FilterChipProps {
  /** Always-visible label (e.g. "Loại"). */
  label: string
  /**
   * Current value's display text. Pass `null`/`undefined` for an unset chip
   * (which renders as `Label ▾` in muted style). Pass a string to switch the
   * chip into "active" state (`Label: Value × ▾` in primary tint).
   */
  value?: string | null
  /** Called when the user clicks the × on an active chip. */
  onClear?: () => void
  /** Popover content — the editor for this filter (radio list, range, etc.). */
  children: React.ReactNode
  /** Optional className override on the trigger button. */
  className?: string
  /** Popover content className override (e.g. wider popover). */
  contentClassName?: string
  /** Anchor side for the popover. Defaults to `bottom`. */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Anchor alignment. Defaults to `start` (left-aligned with trigger). */
  align?: 'start' | 'center' | 'end'
}

/**
 * Compact filter chip used in the inline filter bar pattern.
 *
 *     <FilterChip label='Loại' value={type ? typeLabel(type) : null} onClear={clear}>
 *       <PropertyTypeRadioList value={type} onChange={setType} />
 *     </FilterChip>
 *
 * The `×` clear button is rendered inline on the chip itself (not inside the
 * popover) so users can wipe a filter without opening the editor first.
 */
const FilterChip: React.FC<FilterChipProps> = ({
  label,
  value,
  onClear,
  children,
  className,
  contentClassName,
  side = 'bottom',
  align = 'start',
}) => {
  const isActive = value !== null && value !== undefined && value !== ''

  return (
    <Popover>
      <div
        className={cn(
          'inline-flex items-center rounded-md border h-8 transition-colors',
          isActive
            ? 'border-primary/40 bg-primary/5 text-foreground'
            : 'border-border bg-background text-muted-foreground hover:text-foreground',
          className,
        )}
      >
        <PopoverTrigger asChild>
          <button
            type='button'
            className={cn(
              'flex items-center gap-1 px-2.5 text-sm h-full',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-md',
            )}
          >
            <span className={isActive ? 'text-muted-foreground' : ''}>
              {label}
            </span>
            {isActive && (
              <span className='font-medium text-foreground'>: {value}</span>
            )}
            <ChevronDown className='size-3.5 opacity-60' aria-hidden='true' />
          </button>
        </PopoverTrigger>

        {isActive && onClear && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onClear}
            aria-label={`Clear ${label}`}
            className='size-6 mr-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-transparent'
          >
            <X className='size-3.5' aria-hidden='true' />
          </Button>
        )}
      </div>

      <PopoverContent
        side={side}
        align={align}
        className={cn('w-56 p-1', contentClassName)}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

export { FilterChip }
