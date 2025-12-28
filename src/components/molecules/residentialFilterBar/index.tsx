import React, { useCallback } from 'react'
import {
  CategoryDropdown,
  PriceRangeDropdown,
  SortDropdown,
} from '@/components/molecules/filterDropdown'
import AreaRangeDropdown from '@/components/molecules/areaRangeDropdown'
import { Button } from '@/components/atoms/button'
import Switch from '@/components/atoms/switch'
import { useTranslations } from 'next-intl'
import { Filter, MapIcon, ShieldCheck } from 'lucide-react'

import { LocationSwitch } from '@/components/atoms'
import { useRouter } from 'next/router'
import { ListingFilterRequest, SortKey } from '@/api/types/property.type'
import { useListContext } from '@/contexts/list/useListContext'
import { List } from '@/contexts/list'
import ListSearch from '@/contexts/list/index.search'
import useLocation from '@/hooks/useLocation'
import {
  navigateToPropertiesWithFilters,
  navigateToPropertiesWithClearedFilters,
} from '@/utils/filters'
import { PUBLIC_ROUTES } from '@/constants/route'

interface ResidentialFilterBarProps {
  onOpenAdvanced?: () => void
  onApply?: () => void // Custom apply handler (e.g., navigate from homepage to /properties)
}

const ResidentialFilterBar: React.FC<ResidentialFilterBarProps> = ({
  onOpenAdvanced,
  onApply,
}) => {
  const t = useTranslations('residentialFilter')
  const tActions = useTranslations('residentialFilter.actions')
  const router = useRouter()

  const { filters, updateFilters, resetFilters, activeFilterCount } =
    useListContext<ListingFilterRequest>()

  const { disableLocation } = useLocation()

  const handleApply = () => {
    // If custom onApply handler is provided (e.g., from homepage), use it
    if (onApply) {
      onApply()
      return
    }

    // Default behavior: Navigate to /properties with current filters
    navigateToPropertiesWithFilters(router, filters)
  }

  const handleReset = () => {
    resetFilters()
    // Disable location when filters are reset
    disableLocation()

    // Only navigate to /properties if NOT on homepage (no custom onApply handler)
    if (!onApply) {
      navigateToPropertiesWithClearedFilters(router)
    }
  }

  const handleSortChange = useCallback(
    (value: SortKey) => {
      updateFilters({
        sortBy: value,
        page: 1,
      })
    },
    [updateFilters],
  )

  const updateFilter = useCallback(
    (partial: Partial<ListingFilterRequest>) => {
      updateFilters(partial)
    },
    [updateFilters],
  )

  const handleLocationChange = useCallback(
    (userLatitude?: number, userLongitude?: number) => {
      if (!userLatitude || !userLongitude) {
        // Clear coordinates from filters when location is disabled
        updateFilter({
          userLatitude: undefined,
          userLongitude: undefined,
        })
        disableLocation()
      } else {
        // Update filters with new coordinates
        updateFilter({
          userLatitude: userLatitude,
          userLongitude: userLongitude,
        })
      }
    },
    [updateFilter, disableLocation],
  )

  const handleViewMap = useCallback(() => {
    // Navigate to maps page without any filter query params
    // Maps page handles listing fetching via map bounds, not filters
    router.push(PUBLIC_ROUTES.MAPS)
  }, [router])

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
              <span className='absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full' />
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
            onClick={handleReset}
          >
            {tActions('clear')}
          </Button>
        </div>
      </div>

      {/* Desktop Layout - Full Filter Bar */}
      <div className='hidden md:block space-y-3'>
        <div className='flex flex-col md:flex-row gap-3 items-stretch'>
          <div className='flex-1 flex items-center gap-3'>
            <ListSearch />
            <Button
              variant='default'
              className='h-9 px-6'
              type='button'
              onClick={handleViewMap}
            >
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
              <span className='absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full' />
            )}
          </Button>
          <SortDropdown
            value={filters.sortBy || SortKey.DEFAULT}
            onChange={handleSortChange}
          />
          <CategoryDropdown
            value={filters.categoryId?.toString() || 'all'}
            onChange={(v) => {
              updateFilter({
                categoryId: v === 'all' ? undefined : Number(v),
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
              <LocationSwitch
                onLocationChange={handleLocationChange}
                disabled={false}
              />
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
            onClick={handleReset}
          >
            {tActions('clear')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResidentialFilterBar
