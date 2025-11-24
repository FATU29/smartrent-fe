import React from 'react'
import { useTranslations } from 'next-intl'
import { useListContext } from '@/contexts/list'
import { Typography } from '@/components/atoms/typography'
import { Checkbox } from '@/components/atoms/checkbox'
import { Card } from '@/components/atoms/card'
import { ListingFilterRequest } from '@/api/types'

interface FilterOption {
  label: string
  value: string | number
  min?: number
  max?: number
}

const PropertyFilterSidebar: React.FC = () => {
  const t = useTranslations('propertiesPage.filter')
  const { filters, updateFilters } = useListContext()

  const priceOptions: FilterOption[] = [
    { label: t('price.under1M'), value: 'under1M', min: 0, max: 1000000 },
    { label: t('price.1to3M'), value: '1to3M', min: 1000000, max: 3000000 },
    { label: t('price.3to5M'), value: '3to5M', min: 3000000, max: 5000000 },
    { label: t('price.5to10M'), value: '5to10M', min: 5000000, max: 10000000 },
    {
      label: t('price.10to40M'),
      value: '10to40M',
      min: 10000000,
      max: 40000000,
    },
    {
      label: t('price.40to70M'),
      value: '40to70M',
      min: 40000000,
      max: 70000000,
    },
    {
      label: t('price.70to100M'),
      value: '70to100M',
      min: 70000000,
      max: 100000000,
    },
    { label: t('price.over100M'), value: 'over100M', min: 100000000 },
  ]

  const areaOptions: FilterOption[] = [
    { label: t('area.under30'), value: 'under30', min: 0, max: 30 },
    { label: t('area.30to50'), value: '30to50', min: 30, max: 50 },
    { label: t('area.50to80'), value: '50to80', min: 50, max: 80 },
    { label: t('area.80to100'), value: '80to100', min: 80, max: 100 },
    { label: t('area.100to150'), value: '100to150', min: 100, max: 150 },
    { label: t('area.150to200'), value: '150to200', min: 150, max: 200 },
    { label: t('area.200to250'), value: '200to250', min: 200, max: 250 },
    { label: t('area.250to300'), value: '250to300', min: 250, max: 300 },
    { label: t('area.300to500'), value: '300to500', min: 300, max: 500 },
    { label: t('area.over500'), value: 'over500', min: 500 },
  ]

  const bedroomOptions: FilterOption[] = [
    { label: t('bedroom.1'), value: '1', min: 1, max: 1 },
    { label: t('bedroom.2'), value: '2', min: 2, max: 2 },
    { label: t('bedroom.3'), value: '3', min: 3, max: 3 },
    { label: t('bedroom.4'), value: '4', min: 4, max: 4 },
    { label: t('bedroom.5plus'), value: '5plus', min: 5, max: undefined },
  ]

  const handlePriceChange = (option: FilterOption, checked: boolean) => {
    if (checked) {
      updateFilters({
        minPrice: option.min,
        maxPrice: option.max,
      } as Partial<ListingFilterRequest>)
    } else {
      // Uncheck - clear price filter
      updateFilters({
        minPrice: undefined,
        maxPrice: undefined,
      } as Partial<ListingFilterRequest>)
    }
  }

  const handleAreaChange = (option: FilterOption, checked: boolean) => {
    if (checked) {
      updateFilters({
        minArea: option.min,
        maxArea: option.max,
      } as Partial<ListingFilterRequest>)
    } else {
      // Uncheck - clear area filter
      updateFilters({
        minArea: undefined,
        maxArea: undefined,
      } as Partial<ListingFilterRequest>)
    }
  }

  const handleBedroomChange = (option: FilterOption, checked: boolean) => {
    if (checked) {
      updateFilters({
        minBedrooms: option.min,
        maxBedrooms: option.max,
      } as Partial<ListingFilterRequest>)
    } else {
      // Uncheck - clear bedroom filter
      updateFilters({
        minBedrooms: undefined,
        maxBedrooms: undefined,
      } as Partial<ListingFilterRequest>)
    }
  }

  const isPriceSelected = (option: FilterOption) => {
    return filters.minPrice === option.min && filters.maxPrice === option.max
  }

  const isAreaSelected = (option: FilterOption) => {
    return filters.minArea === option.min && filters.maxArea === option.max
  }

  const isBedroomSelected = (option: FilterOption) => {
    return (
      filters.minBedrooms === option.min && filters.maxBedrooms === option.max
    )
  }

  return (
    <aside className='w-full space-y-4'>
      {/* Price Range Filter */}
      <Card className='p-4'>
        <Typography variant='h6' className='mb-4 font-semibold'>
          {t('price.title')}
        </Typography>
        <div className='space-y-2'>
          {priceOptions.map((option) => (
            <label
              key={option.value}
              className='flex items-center gap-2 cursor-pointer hover:text-primary transition-colors'
            >
              <Checkbox
                checked={isPriceSelected(option)}
                onCheckedChange={(checked) =>
                  handlePriceChange(option, checked as boolean)
                }
              />
              <Typography variant='small' className='text-sm'>
                {option.label}
              </Typography>
            </label>
          ))}
        </div>
      </Card>

      {/* Area Filter */}
      <Card className='p-4'>
        <Typography variant='h6' className='mb-4 font-semibold'>
          {t('area.title')}
        </Typography>
        <div className='space-y-2'>
          {areaOptions.map((option) => (
            <label
              key={option.value}
              className='flex items-center gap-2 cursor-pointer hover:text-primary transition-colors'
            >
              <Checkbox
                checked={isAreaSelected(option)}
                onCheckedChange={(checked) =>
                  handleAreaChange(option, checked as boolean)
                }
              />
              <Typography variant='small' className='text-sm'>
                {option.label}
              </Typography>
            </label>
          ))}
        </div>
      </Card>

      {/* Bedrooms Filter */}
      <Card className='p-4'>
        <Typography variant='h6' className='mb-4 font-semibold'>
          {t('bedroom.title')}
        </Typography>
        <div className='space-y-2'>
          {bedroomOptions.map((option) => (
            <label
              key={option.value}
              className='flex items-center gap-2 cursor-pointer hover:text-primary transition-colors'
            >
              <Checkbox
                checked={isBedroomSelected(option)}
                onCheckedChange={(checked) =>
                  handleBedroomChange(option, checked as boolean)
                }
              />
              <Typography variant='small' className='text-sm'>
                {option.label}
              </Typography>
            </label>
          ))}
        </div>
      </Card>
    </aside>
  )
}

export default PropertyFilterSidebar
