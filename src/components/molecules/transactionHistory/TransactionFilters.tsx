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
import { usePaymentTypeLabel } from './helpers'
import {
  ALL_VALUE,
  TRANSACTION_STATUS_FILTERS,
  TRANSACTION_TYPE_FILTERS,
  type TransactionFilterState,
} from './types'

export interface TransactionFiltersProps {
  value: TransactionFilterState
  onChange: (patch: Partial<TransactionFilterState>) => void
  onReset: () => void
  hasActiveFilters: boolean
}

const FIELD_LABEL = 'text-xs font-medium text-muted-foreground'
const FIELD = 'flex flex-col gap-1.5'

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
    <section className='rounded-xl border bg-card p-card shadow-xs'>
      <div className='flex flex-col gap-row'>
        {/* Search — kept compact; it doesn't need the whole row width */}
        <div className={`${FIELD} w-full sm:w-80`}>
          <span className={FIELD_LABEL}>{t('search')}</span>
          <div className='relative w-full'>
            <Search
              className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
              aria-hidden='true'
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className='h-9 w-full pl-9'
              aria-label={t('search')}
            />
          </div>
        </div>

        {/* Status / Payment type / Date range — below the search bar */}
        <div className='flex flex-wrap items-start gap-row'>
          <div className={FIELD}>
            <span className={FIELD_LABEL}>{t('status')}</span>
            <Select
              value={value.status}
              onValueChange={(status) => onChange({ status })}
            >
              <SelectTrigger
                className='h-9 w-full sm:w-44'
                aria-label={t('status')}
              >
                <SelectValue placeholder={t('allStatuses')} />
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
          </div>

          <div className={FIELD}>
            <span className={FIELD_LABEL}>{t('type')}</span>
            <Select
              value={value.type}
              onValueChange={(type) => onChange({ type })}
            >
              <SelectTrigger
                className='h-9 w-full sm:w-52'
                aria-label={t('type')}
              >
                <SelectValue placeholder={t('allTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>{t('allTypes')}</SelectItem>
                {TRANSACTION_TYPE_FILTERS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {typeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date range — own visible label on top, like the other fields.
              The picker's built-in caption is blanked so there's only one. */}
          <div className={FIELD}>
            <span className={FIELD_LABEL}>{t('dateRange')}</span>
            <DateRangePicker
              from={value.fromDate}
              to={value.toDate}
              onChange={({ from, to }) =>
                onChange({ fromDate: from, toDate: to })
              }
              placeholder={t('dateRangeHint')}
              className='w-full sm:w-[420px]'
            />
          </div>

          {hasActiveFilters && (
            <div className={`${FIELD} ml-auto`}>
              <span className={`${FIELD_LABEL} invisible`} aria-hidden='true'>
                {t('reset')}
              </span>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={onReset}
                className='h-9 gap-1.5 text-muted-foreground hover:text-foreground'
              >
                <X className='size-4' aria-hidden='true' />
                {t('reset')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default TransactionFilters
