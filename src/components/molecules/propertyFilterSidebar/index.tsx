import React from 'react'
import { useTranslations } from 'next-intl'
import { useListContext } from '@/contexts/list'
import { useListingFilterOptions } from '@/hooks/useListings'
import { Typography } from '@/components/atoms/typography'
import { Checkbox } from '@/components/atoms/checkbox'
import { Card } from '@/components/atoms/card'
import { Skeleton } from '@/components/atoms/skeleton'
import { cn } from '@/lib/utils'
import type { FilterBucketOption, ListingFilterRequest } from '@/api/types'

type FilterGroup = 'price' | 'area' | 'bedroom'

const RANGE_FIELDS: Record<
  FilterGroup,
  { min: keyof ListingFilterRequest; max: keyof ListingFilterRequest }
> = {
  price: { min: 'minPrice', max: 'maxPrice' },
  area: { min: 'minArea', max: 'maxArea' },
  bedroom: { min: 'minBedrooms', max: 'maxBedrooms' },
}

const SKELETON_ROWS = 4

const PropertyFilterSidebar: React.FC = () => {
  const t = useTranslations('propertiesPage.filter')
  const tPage = useTranslations('propertiesPage')
  const { filters, updateFilters } = useListContext<ListingFilterRequest>()

  const { data, isPending, isError, refetch } = useListingFilterOptions(filters)

  const isOptionSelected = (group: FilterGroup, option: FilterBucketOption) => {
    const { min: minKey, max: maxKey } = RANGE_FIELDS[group]
    const currentMin = filters[minKey] as number | undefined
    const currentMax = filters[maxKey] as number | undefined
    return (
      (currentMin ?? null) === (option.min ?? null) &&
      (currentMax ?? null) === (option.max ?? null)
    )
  }

  const handleOptionChange = (
    group: FilterGroup,
    option: FilterBucketOption,
    checked: boolean,
  ) => {
    const { min: minKey, max: maxKey } = RANGE_FIELDS[group]
    updateFilters({
      ...filters,
      [minKey]: checked ? (option.min ?? undefined) : undefined,
      [maxKey]: checked ? (option.max ?? undefined) : undefined,
      page: 1,
    })
  }

  const renderSkeleton = () => (
    <div className='space-y-3' aria-busy='true'>
      {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
        <div key={index} className='flex items-center gap-2'>
          <Skeleton className='h-4 w-4 rounded-sm' />
          <Skeleton className='h-4 w-2/3' />
        </div>
      ))}
    </div>
  )

  const renderError = () => (
    <div className='space-y-2'>
      <Typography variant='small' className='text-sm text-muted-foreground'>
        {t('error')}
      </Typography>
      <button
        type='button'
        onClick={() => refetch()}
        className='text-sm text-primary hover:underline'
      >
        {tPage('retry')}
      </button>
    </div>
  )

  const renderOptions = (group: FilterGroup, options: FilterBucketOption[]) => (
    <div className='space-y-2'>
      {options.map((option) => {
        const selected = isOptionSelected(group, option)
        const disabled = option.count === 0 && !selected

        return (
          <label
            key={option.key}
            className={cn(
              'flex items-center gap-2 transition-colors',
              disabled
                ? 'cursor-not-allowed text-muted-foreground'
                : 'cursor-pointer hover:text-primary',
            )}
          >
            <Checkbox
              checked={selected}
              disabled={disabled}
              onCheckedChange={(checked) =>
                handleOptionChange(group, option, checked as boolean)
              }
            />
            <Typography variant='small' className='text-sm'>
              {t('optionWithCount', {
                label: t(`${group}.${option.key}` as string),
                count: option.count,
              })}
            </Typography>
          </label>
        )
      })}
    </div>
  )

  const renderSection = (
    group: FilterGroup,
    options?: FilterBucketOption[],
  ) => (
    <Card className='p-4'>
      <Typography variant='h6' className='mb-4 font-semibold'>
        {t(`${group}.title` as string)}
      </Typography>
      {isPending && renderSkeleton()}
      {!isPending && isError && renderError()}
      {!isPending && !isError && renderOptions(group, options ?? [])}
    </Card>
  )

  return (
    <aside className='w-full space-y-4'>
      {renderSection('price', data?.priceOptions)}
      {renderSection('area', data?.areaOptions)}
      {renderSection('bedroom', data?.bedroomOptions)}
    </aside>
  )
}

export default PropertyFilterSidebar
