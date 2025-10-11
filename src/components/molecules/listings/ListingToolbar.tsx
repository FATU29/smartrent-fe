import React from 'react'
import { Search, Filter, FileDown } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { NUMBERS } from '@/constants/numbers'

interface ListingToolbarProps {
  total: number
  onSearch: (q: string) => void
  onFilterClick?: () => void
  onExport?: () => void
  className?: string
  // Optional children to render inside the Filter button (e.g., count badge)
  filterButtonChildren?: React.ReactNode
}

export const ListingToolbar: React.FC<ListingToolbarProps> = ({
  total,
  onSearch,
  onFilterClick,
  onExport,
  className,
  filterButtonChildren,
}) => {
  const t = useTranslations('seller.listingManagement.toolbar')
  const [value, setValue] = React.useState('')
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setValue(v)
    onSearch(v)
  }

  const totalLabel =
    total === NUMBERS.ZERO
      ? t('totalZero')
      : total === NUMBERS.ONE
        ? t('totalOne')
        : t('totalMany', { count: total })

  return (
    <div
      className={cn(
        'flex flex-col gap-3 md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <div className='flex w-full flex-col gap-3 md:flex-row md:items-center'>
        <div className='relative w-full md:w-80'>
          <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <input
            value={value}
            onChange={handleChange}
            placeholder={t('searchPlaceholder')}
            className='w-full rounded-lg border bg-background/60 pl-10 pr-8 py-2 text-sm shadow-sm focus:outline-none focus-visible:outline-none'
          />
          {value && (
            <button
              type='button'
              onClick={() => {
                setValue('')
                onSearch('')
              }}
              className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-1 text-[10px] font-medium text-muted-foreground hover:text-foreground'
            >
              ×
            </button>
          )}
        </div>
        <div className='flex gap-2 items-center'>
          <Button
            type='button'
            variant='outline'
            onClick={onFilterClick}
            className='gap-1.5'
          >
            <Filter size={14} />
            <span className='inline-flex items-center gap-1.5'>
              {t('filter')}
              {filterButtonChildren}
            </span>
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={onExport}
            className='gap-1.5'
          >
            <FileDown size={14} /> {t('export')}
          </Button>
        </div>
      </div>
      <div className='text-xs font-medium text-muted-foreground md:text-right'>
        {totalLabel}
      </div>
    </div>
  )
}
