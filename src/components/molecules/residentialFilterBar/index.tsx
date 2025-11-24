import React, { useCallback } from 'react'
import SearchInput from '@/components/molecules/searchInput'
import {
  PropertyTypeDropdown,
  PriceRangeDropdown,
} from '@/components/molecules/filterDropdown'
import AreaRangeDropdown from '@/components/molecules/areaRangeDropdown'
import { Button } from '@/components/atoms/button'
import Switch from '@/components/atoms/switch'
import { useTranslations } from 'next-intl'
import { Filter, MapIcon, ShieldCheck } from 'lucide-react'

import { LocationSwitch } from '@/components/atoms'
import { useRouter } from 'next/router'
import { pushQueryParams } from '@/utils/queryParams'
import { PUBLIC_ROUTES } from '@/constants/route'
import { ListingFilterRequest } from '@/api/types'
import { useListContext } from '@/contexts/list/useListContext'
import { List } from '@/contexts/list'

interface ResidentialFilterBarProps {
  onOpenAdvanced?: () => void
}

const ResidentialFilterBar: React.FC<ResidentialFilterBarProps> = ({
  onOpenAdvanced,
}) => {
  const t = useTranslations('residentialFilter')
  const tActions = useTranslations('residentialFilter.actions')
  const router = useRouter()

  const { filters, updateFilters, resetFilters, activeFilterCount } =
    useListContext<unknown>()

  const handleApply = () => {
    const amenityIds = filters.amenityIds

    pushQueryParams(
      router,
      {
        categoryId: filters.categoryId ?? null,
        productType: filters.productType ?? null,
        keyword: filters.keyword || null,
        minPrice: filters.minPrice ?? null,
        maxPrice: filters.maxPrice ?? null,
        minArea: filters.minArea ?? null,
        maxArea: filters.maxArea ?? null,
        minBedrooms: filters.minBedrooms ?? null,
        maxBedrooms: filters.maxBedrooms ?? null,
        bathrooms: filters.bathrooms ?? null,
        verified: filters.verified || null,
        direction: filters.direction ?? null,
        electricityPrice: filters.electricityPrice ?? null,
        waterPrice: filters.waterPrice ?? null,
        internetPrice: filters.internetPrice ?? null,
        amenityIds:
          amenityIds && amenityIds.length > 0 ? amenityIds.join(',') : null,
        provinceId: filters.provinceId ?? null,
        districtId: filters.districtId ?? null,
        wardId: filters.wardId ?? null,
        isLegacy: filters.isLegacy ?? null,
        latitude: filters.latitude ?? null,
        longitude: filters.longitude ?? null,
        page: null,
      },
      {
        pathname: PUBLIC_ROUTES.PROPERTIES_PREFIX,
        shallow: false,
        scroll: true,
      },
    )
  }

  const updateFilter = (partial: Partial<ListingFilterRequest>) => {
    updateFilters(partial)
  }

  const handleLocationChange = useCallback(
    (latitude: number | null, longitude: number | null) => {
      updateFilter({
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      })
    },
    [],
  )

  return (
    <div className='w-full space-y-3'>
      {/* Location enabled banner with coordinates removed per requirement */}

      {/* Mobile Layout */}
      <div className='md:hidden flex flex-col gap-2'>
        {/* Row 1: Search + Filter */}
        <div className='flex gap-2'>
          <List.Search placeholder={t('searchPlaceholder')} />
          <Button
            variant='outline'
            className='h-9 px-3 relative'
            onClick={onOpenAdvanced}
          >
            <Filter className='h-4 w-4' />
            {typeof activeFilterCount === 'number' && activeFilterCount > 0 && (
              <span className='absolute -top-1 -right-1 bg-destructive text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full'>
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Row 2: Apply + Reset */}
        <div className='flex gap-2'>
          <Button
            variant='default'
            className='h-9 px-4 flex-1'
            type='button'
            onClick={handleApply}
          >
            {tActions('apply')}
          </Button>
          <Button
            variant='outline'
            className='h-9 px-4 flex-1'
            type='button'
            onClick={resetFilters}
          >
            {tActions('clear')}
          </Button>
        </div>
      </div>

      {/* Desktop Layout - Full Filter Bar */}
      <div className='hidden md:block space-y-3'>
        <div className='flex flex-col md:flex-row gap-3 items-stretch'>
          <div className='flex-1 flex items-center gap-3'>
            <SearchInput
              value={filters.keyword || ''}
              onChange={(val) => updateFilters({ keyword: val })}
              placeholder={t('searchPlaceholder')}
              className='flex-1'
            />
            <Button variant='default' className='h-9 px-6' type='button'>
              <MapIcon className='h-4 w-4 mr-1' /> {t('actions.viewMap')}
            </Button>
          </div>
        </div>

        <div className='flex flex-wrap gap-2 items-center'>
          <Button
            variant='outline'
            size='sm'
            className='h-9 px-3 relative'
            type='button'
            onClick={onOpenAdvanced}
          >
            <Filter className='h-4 w-4 mr-1' /> {t('actions.filter')}
            {typeof activeFilterCount === 'number' && activeFilterCount > 0 && (
              <span className='absolute -top-1 -right-1 bg-destructive text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full'>
                {activeFilterCount}
              </span>
            )}
          </Button>
          <PropertyTypeDropdown
            value={filters.productType || 'tat-ca'}
            onChange={(v) => {
              updateFilter({
                productType:
                  v === 'any'
                    ? undefined
                    : (v as ListingFilterRequest['productType']),
                page: 1,
              })
            }}
          />
          <PriceRangeDropdown
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onChange={(min, max) => {
              updateFilter({ minPrice: min, maxPrice: max, page: 1 })
            }}
          />
          <AreaRangeDropdown
            minArea={filters.minArea}
            maxArea={filters.maxArea}
            onChange={(min, max) => {
              updateFilter({ minArea: min, maxArea: max, page: 1 })
            }}
          />
          <div className='flex items-center gap-4 ml-2'>
            <div className='flex items-center gap-1'>
              <Switch
                size='sm'
                checked={!!filters.verified}
                onCheckedChange={(v) => updateFilter({ verified: v, page: 1 })}
              />
              <span className='text-sm flex items-center gap-1'>
                <ShieldCheck className='h-3.5 w-3.5 text-muted-foreground' />
                {t('toggles.verified')}
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <LocationSwitch onLocationChange={handleLocationChange} />
            </div>
          </div>
        </div>

        {/* Apply and Reset buttons - New row */}
        <div className='flex gap-2 items-center'>
          <Button
            variant='default'
            className='h-9 px-6'
            type='button'
            onClick={handleApply}
          >
            {tActions('apply')}
          </Button>
          <Button
            variant='outline'
            className='h-9 px-6'
            type='button'
            onClick={resetFilters}
          >
            {tActions('clear')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResidentialFilterBar
