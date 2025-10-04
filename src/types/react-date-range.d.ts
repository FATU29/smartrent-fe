declare module 'react-date-range' {
  import * as React from 'react'
  export interface Range {
    startDate?: Date
    endDate?: Date
    key?: string
  }
  export interface RangeKeyDict {
    [key: string]: Range
  }
  export interface DateRangeProps {
    ranges: Range[]
    onChange: (r: RangeKeyDict) => void
    months?: number
    direction?: 'vertical' | 'horizontal'
    moveRangeOnFirstSelection?: boolean
    showDateDisplay?: boolean
    rangeColors?: string[]
    weekdayDisplayFormat?: string
    monthDisplayFormat?: string
    editableDateInputs?: boolean
  }
  export const DateRange: React.ComponentType<DateRangeProps>
}
