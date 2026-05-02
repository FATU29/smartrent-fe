import React from 'react'
import { Search, SlidersHorizontal, X, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/button'
import { FilterChip } from '@/components/atoms/filterChip'
import { Input } from '@/components/atoms/input'
import { useListContext } from '@/contexts/list/useListContext'
import { cn } from '@/lib/utils'
import { NUMBERS } from '@/constants/numbers'
import { type PropertyType, SortKey } from '@/api/types/property.type'

interface ListingToolbarProps {
  total: number
  keyword?: string
  onSearch: (q: string) => void
  /**
   * Opens the existing dialog for advanced filters not exposed as chips
   * (area, direction, amenities, utility prices, etc.).
   */
  onMoreFiltersClick?: () => void
  className?: string
}

const PROPERTY_TYPE_OPTIONS: Array<{
  value?: PropertyType
  i18nKey: string
}> = [
  { value: undefined, i18nKey: 'any' },
  { value: 'APARTMENT', i18nKey: 'apartment' },
  { value: 'HOUSE', i18nKey: 'house' },
  { value: 'ROOM', i18nKey: 'room' },
  { value: 'STUDIO', i18nKey: 'studio' },
]

const SORT_OPTIONS: Array<{ value: SortKey; i18nKey: string }> = [
  { value: SortKey.DEFAULT, i18nKey: 'default' },
  { value: SortKey.NEWEST, i18nKey: 'newest' },
  { value: SortKey.OLDEST, i18nKey: 'oldest' },
  { value: SortKey.PRICE_ASC, i18nKey: 'priceAsc' },
  { value: SortKey.PRICE_DESC, i18nKey: 'priceDesc' },
]

export const ListingToolbar: React.FC<ListingToolbarProps> = ({
  total,
  keyword,
  onSearch,
  onMoreFiltersClick,
  className,
}) => {
  const t = useTranslations('seller.listingManagement.toolbar')
  const tType = useTranslations('residentialFilter.propertyType')
  const tSort = useTranslations('propertiesPage.sort')

  const { filters, updateFilters } = useListContext()
  const [value, setValue] = React.useState(keyword ?? '')

  // Sync with external keyword (e.g. on filter reset)
  React.useEffect(() => {
    setValue(keyword ?? '')
  }, [keyword])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setValue(v)
    onSearch(v)
  }

  const handleClear = () => {
    setValue('')
    onSearch('')
  }

  const totalLabel =
    total === NUMBERS.ZERO
      ? t('totalZero')
      : total === NUMBERS.ONE
        ? t('totalOne')
        : t('totalMany', { count: total })

  // ── Type chip ──
  const productType = filters.productType as PropertyType | undefined
  const typeOption = PROPERTY_TYPE_OPTIONS.find((o) => o.value === productType)
  const typeValue = productType ? tType(typeOption?.i18nKey ?? 'any') : null

  const setProductType = (next?: PropertyType) => {
    updateFilters({ productType: next, page: 1 })
  }

  // ── Sort chip ──
  const sortBy = filters.sortBy as SortKey | undefined
  const sortValue =
    sortBy && sortBy !== SortKey.DEFAULT
      ? tSort(
          SORT_OPTIONS.find((o) => o.value === sortBy)?.i18nKey ?? 'default',
        )
      : null

  const setSort = (next?: SortKey) => {
    updateFilters({
      sortBy: next === SortKey.DEFAULT ? undefined : next,
      page: 1,
    })
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center',
        className,
      )}
    >
      {/* Keyword search */}
      <div className='relative w-full sm:w-64'>
        <Search
          className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
          aria-hidden='true'
        />
        <Input
          value={value}
          onChange={handleChange}
          placeholder={t('searchPlaceholder')}
          className='pl-9 pr-9 h-8'
        />
        {value && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={handleClear}
            aria-label={t('searchPlaceholder')}
            className='absolute right-1 top-1/2 size-6 -translate-y-1/2 rounded-md text-muted-foreground hover:text-foreground'
          >
            <X className='size-3.5' aria-hidden='true' />
          </Button>
        )}
      </div>

      {/* Type chip */}
      <FilterChip
        label={t('type')}
        value={typeValue}
        onClear={() => setProductType(undefined)}
      >
        <RadioList
          options={PROPERTY_TYPE_OPTIONS.map((o) => ({
            key: o.i18nKey,
            label: tType(o.i18nKey),
            selected: productType === o.value,
            onSelect: () => setProductType(o.value),
          }))}
        />
      </FilterChip>

      {/* Sort chip */}
      <FilterChip
        label={t('sort')}
        value={sortValue}
        onClear={() => setSort(undefined)}
      >
        <RadioList
          options={SORT_OPTIONS.map((o) => ({
            key: o.i18nKey,
            label: tSort(o.i18nKey),
            selected: (sortBy ?? SortKey.DEFAULT) === o.value,
            onSelect: () => setSort(o.value),
          }))}
        />
      </FilterChip>

      {/* More filters — opens the existing advanced-filter dialog */}
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={onMoreFiltersClick}
        className='gap-1.5 h-8 px-2.5 text-muted-foreground hover:text-foreground'
      >
        <SlidersHorizontal className='size-3.5' aria-hidden='true' />
        <span>{t('moreFilters')}</span>
      </Button>

      <span className='text-sm text-muted-foreground tabular-nums whitespace-nowrap sm:pl-2'>
        {totalLabel}
      </span>
    </div>
  )
}

interface RadioListProps {
  options: Array<{
    key: string
    label: string
    selected: boolean
    onSelect: () => void
  }>
}

const RadioList: React.FC<RadioListProps> = ({ options }) => (
  <div className='flex flex-col'>
    {options.map((opt) => (
      <button
        key={opt.key}
        type='button'
        onClick={opt.onSelect}
        className={cn(
          'flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm text-left transition-colors',
          'hover:bg-accent',
          opt.selected && 'text-primary font-medium',
        )}
      >
        <span>{opt.label}</span>
        {opt.selected && <Check className='size-4' aria-hidden='true' />}
      </button>
    ))}
  </div>
)
