import { format } from 'date-fns'
import { SelectOption } from '@/components/atoms/select-dropdown'
import { POSTING_DATE_VALUES } from '../constants'

export interface DateSelectOptionsParams {
  t: (key: string) => string // Translation function
  values: {
    postingDateFrom?: string
    postingDateTo?: string
  }
}

export const generateDateSelectOptions = ({
  t,
  values,
}: DateSelectOptionsParams): SelectOption[] => {
  const bothDates = !!(values.postingDateFrom && values.postingDateTo)

  const baseOptions: SelectOption[] = [
    {
      value: POSTING_DATE_VALUES.DEFAULT,
      label: t('postingDateDefault'),
    },
    {
      value: POSTING_DATE_VALUES.TODAY,
      label: t('today'),
    },
    {
      value: POSTING_DATE_VALUES.YESTERDAY,
      label: t('yesterday'),
    },
    {
      value: POSTING_DATE_VALUES.LAST_7_DAYS,
      label: t('postingDateLast7Days'),
    },
    {
      value: POSTING_DATE_VALUES.LAST_30_DAYS,
      label: t('postingDateLast30Days'),
    },
  ]

  // Add custom date range option
  if (bothDates) {
    baseOptions.push({
      value: POSTING_DATE_VALUES.CUSTOM_EDIT,
      label: `${format(new Date(values.postingDateFrom!), 'dd/MM')} - ${format(new Date(values.postingDateTo!), 'dd/MM')}`,
    })
  } else {
    baseOptions.push({
      value: POSTING_DATE_VALUES.CUSTOM,
      label: t('postingDateCustom'),
    })
  }

  return baseOptions
}
