import React from 'react'
import { useTranslations } from 'next-intl'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/atoms/input'
import { Button } from '@/components/atoms/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select'
import { DateRangePicker } from '@/components/atoms/date-range-picker'
import { useDebounce } from '@/hooks/useDebounce'
import { CUSTOMER_TRANSACTION_TYPES } from '@/api/types/customer-transaction.type'
import { usePaymentTypeLabel } from './helpers'
import {
  ALL_VALUE,
  TRANSACTION_STATUS_FILTERS,
  type TransactionFilterState,
} from './types'

export interface TransactionFiltersProps {
  value: TransactionFilterState
  onChange: (patch: Partial<TransactionFilterState>) => void
  onReset: () => void
  hasActiveFilters: boolean
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  value,
  onChange,
  onReset,
  hasActiveFilters,
}) => {
  const t = useTranslations('seller.transactions.filters')
  const tStatus = useTranslations('components.paymentStatusBadge')
  const typeLabel = usePaymentTypeLabel()

  // Local, debounced search so typing stays snappy and the URL/query only
  // updates after the user pauses.
  const [search, setSearch] = React.useState(value.q)
  const debounced = useDebounce(search, 400)

  React.useEffect(() => {
    setSearch(value.q)
  }, [value.q])

  React.useEffect(() => {
    // Guarded against the round-trip: once onChange propagates `debounced`
    // back into value.q the condition is false, so this can't loop.
    if (debounced !== value.q) onChange({ q: debounced })
  }, [debounced, value.q, onChange])

  return (
    <div className='flex flex-col gap-row'>
      <div className='flex flex-col gap-row sm:flex-row sm:flex-wrap sm:items-end'>
        <div className='relative flex-1 min-w-[200px]'>
          <Search
            className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
            aria-hidden='true'
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className='pl-9'
            aria-label={t('searchPlaceholder')}
          />
        </div>

        <Select
          value={value.status}
          onValueChange={(status) => onChange({ status })}
        >
          <SelectTrigger className='w-full sm:w-44' aria-label={t('status')}>
            <SelectValue placeholder={t('status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>{t('allStatuses')}</SelectItem>
            {TRANSACTION_STATUS_FILTERS.map((status) => (
              <SelectItem key={status} value={status}>
                {tStatus(status.toLowerCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={value.type} onValueChange={(type) => onChange({ type })}>
          <SelectTrigger className='w-full sm:w-52' aria-label={t('type')}>
            <SelectValue placeholder={t('type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>{t('allTypes')}</SelectItem>
            {CUSTOMER_TRANSACTION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {typeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onReset}
            className='gap-1.5 self-start sm:self-auto'
          >
            <X className='size-4' aria-hidden='true' />
            {t('reset')}
          </Button>
        )}
      </div>

      <DateRangePicker
        from={value.fromDate}
        to={value.toDate}
        onChange={({ from, to }) => onChange({ fromDate: from, toDate: to })}
        labels={{
          from: t('dateFrom'),
          to: t('dateTo'),
          placeholder: t('dateRange'),
        }}
        className='sm:max-w-md'
      />
    </div>
  )
}

export default TransactionFilters
