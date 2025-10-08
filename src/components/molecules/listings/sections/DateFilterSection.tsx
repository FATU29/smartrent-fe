import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { DateRangePicker } from '@/components/atoms/date-range-picker'
import SelectDropdown from '@/components/atoms/select-dropdown'
import { Pencil } from 'lucide-react'
import { FilterSection } from '@/components/atoms/filter-section'
import { ListingFilterValues } from '../ListingFilterContent'
import { POSTING_DATE_VALUES } from '../constants'
import { generateDateSelectOptions } from '../utils/dateSelectOptions'

interface DateFilterSectionProps {
  values: ListingFilterValues
  onChange: (v: ListingFilterValues) => void
  onCustomRangeChange?: (show: boolean) => void
  showCustomRange: boolean
}

export const DateFilterSection: React.FC<DateFilterSectionProps> = ({
  values,
  onChange,
  onCustomRangeChange,
  showCustomRange,
}) => {
  const t = useTranslations('seller.listingManagement.filter')

  const bothDates = !!(values.postingDateFrom && values.postingDateTo)

  if (showCustomRange) {
    return (
      <div className='space-y-4'>
        <FilterSection label={t('dateRangeTitle')}>
          <DateRangePicker
            from={values.postingDateFrom}
            to={values.postingDateTo}
            labels={{
              from: t('fromDate'),
              to: t('toDate'),
              placeholder: t('datePlaceholder'),
            }}
            onChange={({ from, to }) =>
              onChange({
                ...values,
                postingDateFrom: from,
                postingDateTo: to,
              })
            }
          />
        </FilterSection>
      </div>
    )
  }

  const dateOptions = generateDateSelectOptions({
    t,
    values: {
      postingDateFrom: values.postingDateFrom,
      postingDateTo: values.postingDateTo,
    },
  })

  const handleDateChange = (value: string) => {
    if (
      value === POSTING_DATE_VALUES.CUSTOM ||
      value === POSTING_DATE_VALUES.CUSTOM_EDIT
    ) {
      if (
        values.postingDate === POSTING_DATE_VALUES.CUSTOM &&
        values.postingDateFrom &&
        values.postingDateTo &&
        value === POSTING_DATE_VALUES.CUSTOM_EDIT
      ) {
        return onChange({
          ...values,
          postingDate: POSTING_DATE_VALUES.CUSTOM,
          postingDateTo: undefined,
        })
      }
      return onChange({
        ...values,
        postingDate: POSTING_DATE_VALUES.CUSTOM,
        postingDateFrom: values.postingDateFrom,
      })
    }
    onChange({
      ...values,
      postingDate: value,
      postingDateFrom: undefined,
      postingDateTo: undefined,
    })
  }

  return (
    <FilterSection label={t('postingDate')}>
      <div className='flex gap-2 items-center'>
        <div className='flex-1 relative'>
          <SelectDropdown
            value={
              values.postingDate === POSTING_DATE_VALUES.CUSTOM_APPLIED
                ? POSTING_DATE_VALUES.CUSTOM_EDIT
                : values.postingDate
            }
            onValueChange={handleDateChange}
            placeholder={t('postingDate')}
            options={dateOptions}
            variant='outline'
            size='md'
            className='[&_button]:rounded-full [&_button]:h-12'
          />
        </div>
        {bothDates && (
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='h-12 w-12 rounded-full p-0'
            onClick={() => onCustomRangeChange?.(true)}
          >
            <Pencil className='h-4 w-4' />
          </Button>
        )}
      </div>
    </FilterSection>
  )
}
