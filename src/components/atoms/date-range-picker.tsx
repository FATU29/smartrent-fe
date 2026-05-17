import * as React from 'react'
import {
  DateRange as RDRComponent,
  RangeKeyDict,
  Range as RDRRange,
} from 'react-date-range'
import { addDays, format, isBefore } from 'date-fns'
import { CalendarRange } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Popover, PopoverTrigger, PopoverContent } from './popover'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

export interface DateRangePickerProps {
  from?: string
  to?: string
  onChange: (range: { from?: string; to?: string }) => void
  /**
   * Empty-state text for the start/end buttons. The caller is expected to
   * render its own field label above the picker, so this is just a hint.
   */
  placeholder?: string
  className?: string
}

// Utility to convert ISO (yyyy-MM-dd) to Date (safe) & vice versa
const parseIso = (v?: string) => (v ? new Date(v + 'T00:00:00') : undefined)
const toIso = (d?: Date) => (d ? d.toISOString().split('T')[0] : undefined)

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  from,
  to,
  onChange,
  placeholder = '',
  className,
}) => {
  const t = useTranslations('components.dateRangePicker')
  const [open, setOpen] = React.useState(false)
  const [activeField, setActiveField] = React.useState<'from' | 'to' | null>(
    null,
  )
  const [partialFrom, setPartialFrom] = React.useState<Date | undefined>(
    undefined,
  )
  const fromDate = parseIso(from)
  const toDate = parseIso(to)

  // Local state to allow partial selection before closing
  const [range, setRange] = React.useState<RDRRange[]>([
    {
      startDate: fromDate || new Date(),
      endDate: toDate || (fromDate ? addDays(fromDate, 0) : new Date()),
      key: 'selection',
    },
  ])

  React.useEffect(() => {
    // sync external changes
    if (fromDate || toDate) {
      setRange([
        {
          startDate: fromDate || toDate || new Date(),
          endDate: toDate || fromDate || new Date(),
          key: 'selection',
        },
      ])
    }
  }, [from, to])

  // current selection stored in range[0]

  const handleSelect = (r: RangeKeyDict) => {
    const sel = r.selection
    // First click: set start only
    if (!sel.endDate || sel.startDate?.getTime() === sel.endDate?.getTime()) {
      setPartialFrom(sel.startDate)
      setRange([
        {
          startDate: sel.startDate,
          endDate: sel.startDate,
          key: 'selection',
        },
      ])
      if (activeField === 'from') {
        // After selecting from, automatically shift focus to choosing end
        setActiveField('to')
      }
      return
    }

    // Second click: finalize range
    const start =
      sel.startDate && sel.endDate && isBefore(sel.endDate, sel.startDate)
        ? sel.endDate
        : sel.startDate
    const end =
      sel.startDate && sel.endDate && isBefore(sel.endDate, sel.startDate)
        ? sel.startDate
        : sel.endDate
    setRange([{ startDate: start, endDate: end, key: 'selection' }])
    onChange({ from: toIso(start || undefined), to: toIso(end || undefined) })
    setPartialFrom(undefined)
    setActiveField(null)
    setOpen(false)
  }

  const reset = () => {
    setRange([{ startDate: new Date(), endDate: new Date(), key: 'selection' }])
    onChange({ from: undefined, to: undefined })
  }

  const renderBtn = (date?: Date, field?: 'from' | 'to') => (
    <Button
      type='button'
      variant='outline'
      onClick={() => {
        setActiveField(field || null)
        setOpen(true)
      }}
      className={cn(
        'h-12 justify-start gap-2 rounded-full px-5 font-normal w-full text-left',
        !date && 'text-muted-foreground',
      )}
    >
      <CalendarRange
        className='size-4 shrink-0 opacity-70'
        aria-hidden='true'
      />
      <span className='truncate'>
        {date ? format(date, 'dd/MM/yyyy') : placeholder}
      </span>
    </Button>
  )

  return (
    <div className={cn('space-y-3', className)}>
      <div className='grid grid-cols-2 gap-3'>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            {renderBtn(fromDate || partialFrom, 'from')}
          </PopoverTrigger>
          <PopoverContent className='p-2 w-auto' align='start'>
            <InnerCalendar range={range} onSelect={handleSelect} />
            <div className='flex justify-between gap-2 mt-2'>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={reset}
                className='rounded-full px-4'
              >
                {t('reset')}
              </Button>
              {partialFrom && !toDate && (
                <span className='text-xs text-muted-foreground py-1 px-2'>
                  {t('selectEndDate')}
                </span>
              )}
            </div>
          </PopoverContent>
        </Popover>
        {renderBtn(toDate, 'to')}
      </div>
    </div>
  )
}

const InnerCalendar: React.FC<{
  range: RDRRange[]
  onSelect: (r: RangeKeyDict) => void
}> = ({ range, onSelect }) => {
  return (
    <div className='rounded-md border p-2 bg-background'>
      <RDRComponent
        onChange={onSelect}
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
  )
}
