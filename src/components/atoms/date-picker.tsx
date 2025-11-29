import * as React from 'react'
import { DateRange, Range, RangeKeyDict } from 'react-date-range'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Popover, PopoverTrigger, PopoverContent } from './popover'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

export interface DatePickerProps {
  value?: string // ISO format: yyyy-MM-dd
  onChange: (date?: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: string
}

// Utility to convert ISO (yyyy-MM-dd) to Date & vice versa
const parseIso = (v?: string) => {
  if (!v || v.trim().length === 0) return undefined
  const date = new Date(v + 'T00:00:00')
  // Check if date is valid
  return isNaN(date.getTime()) ? undefined : date
}
const toIso = (d?: Date) => {
  if (!d) return undefined
  // Check if date is valid
  return isNaN(d.getTime()) ? undefined : d.toISOString().split('T')[0]
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  error,
}) => {
  const t = useTranslations('common')
  const [open, setOpen] = React.useState(false)
  const selectedDate = parseIso(value)

  // Get today at midnight for min date comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [range, setRange] = React.useState<Range[]>([
    {
      startDate: selectedDate || today,
      endDate: selectedDate || today,
      key: 'selection',
    },
  ])

  React.useEffect(() => {
    const parsed = parseIso(value)
    if (parsed) {
      setRange([
        {
          startDate: parsed,
          endDate: parsed,
          key: 'selection',
        },
      ])
    }
  }, [value])

  const handleSelect = (r: RangeKeyDict) => {
    const sel = r.selection
    if (sel.startDate) {
      // Check if selected date is not in the past
      const selectedDateOnly = new Date(sel.startDate)
      selectedDateOnly.setHours(0, 0, 0, 0)

      if (selectedDateOnly < today) {
        // Don't allow selecting past dates
        return
      }

      onChange(toIso(sel.startDate))
      setRange([
        {
          startDate: sel.startDate,
          endDate: sel.startDate,
          key: 'selection',
        },
      ])
      setOpen(false)
    }
  }

  const reset = () => {
    onChange(undefined)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    setRange([
      {
        startDate: today,
        endDate: today,
        key: 'selection',
      },
    ])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          disabled={disabled}
          className={cn(
            'w-full h-12 justify-start text-left font-normal rounded-xl px-4 border-2',
            !selectedDate && 'text-muted-foreground',
            error
              ? 'border-destructive dark:border-destructive focus:border-destructive focus:ring-destructive/50'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
            className,
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {selectedDate && !isNaN(selectedDate.getTime())
            ? format(selectedDate, 'dd/MM/yyyy')
            : placeholder || t('selectDate')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <div className='rounded-md border-0 p-0 bg-background'>
          <DateRange
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            months={1}
            direction='horizontal'
            ranges={range}
            showDateDisplay={false}
            rangeColors={['hsl(var(--primary))']}
            weekdayDisplayFormat='EE'
            monthDisplayFormat='MMM yyyy'
            editableDateInputs={false}
          />
        </div>
        {selectedDate && (
          <div className='p-3 border-t'>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={reset}
              className='w-full'
            >
              {t('reset')}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
