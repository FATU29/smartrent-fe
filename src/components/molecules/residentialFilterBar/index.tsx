import React, { useState, useEffect } from 'react'
import SearchInput from '@/components/molecules/searchInput'
import {
  PropertyTypeDropdown,
  PriceRangeDropdown,
} from '@/components/molecules/filterDropdown'
import AreaRangeDropdown from '@/components/molecules/areaRangeDropdown'
import { Button } from '@/components/atoms/button'
import Switch from '@/components/atoms/switch'
import { useTranslations } from 'next-intl'
import { Filter, MapIcon, ShieldCheck, Briefcase } from 'lucide-react'
import { useLocation } from '@/hooks/useLocation'

import { ListFilters } from '@/contexts/list/index.type'
import { LocationSwitch } from '@/components/atoms'

interface ResidentialFilterBarProps {
  onSearch?: (query: string) => void
  onFiltersChange?: (filters: ListFilters) => void
  value?: ListFilters // controlled filters (optional)
  activeCount?: number
  onOpenAdvanced?: () => void // opens the new unified dialog
}

const ResidentialFilterBar: React.FC<ResidentialFilterBarProps> = ({
  onSearch,
  onFiltersChange,
  value,
  activeCount,
  onOpenAdvanced,
}) => {
  const t = useTranslations('residentialFilter')
  const { coordinates, isEnabled, disableLocation } = useLocation()
  const [search, setSearch] = useState(value?.search || '')
  const [propertyType, setPropertyType] = useState<string>(
    value?.propertyType || 'any',
  )
  const [minPrice, setMinPrice] = useState<number | undefined>(value?.minPrice)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(value?.maxPrice)
  const [minArea, setMinArea] = useState<number | undefined>(value?.minArea)
  const [maxArea, setMaxArea] = useState<number | undefined>(value?.maxArea)
  const [verified, setVerified] = useState<boolean>(!!value?.verified)
  const [professional, setProfessional] = useState<boolean>(
    !!value?.professionalBroker,
  )

  useEffect(() => {
    if (!value) return
    setSearch(value.search || '')
    setPropertyType(value.propertyType || 'any')
    setMinPrice(value.minPrice)
    setMaxPrice(value.maxPrice)
    setMinArea(value.minArea)
    setMaxArea(value.maxArea)
    setVerified(!!value.verified)
    setProfessional(!!value.professionalBroker)
  }, [value])

  const handleApply = () => {
    const filters: ListFilters = {
      propertyType: propertyType === 'any' ? undefined : propertyType,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      verified,
      professionalBroker: professional,
      search,
      perPage: value?.perPage || 10,
      page: 1,
    }
    onFiltersChange?.(filters)
    onSearch?.(search)
  }

  const handleClear = () => {
    setSearch('')
    setPropertyType('any')
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setMinArea(undefined)
    setMaxArea(undefined)
    setVerified(false)
    setProfessional(false)
    disableLocation()
    onFiltersChange?.({ search: '', perPage: 10, page: 1 })
    onSearch?.('')
  }

  return (
    <div className='w-full space-y-3'>
      {isEnabled && coordinates && (
        <div className='flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-sm'>
          <span className='text-primary'>📍</span>
          <span className='text-primary font-medium'>
            {t('locationEnabled')}
          </span>
          <span className='text-xs text-muted-foreground ml-auto hidden sm:inline'>
            {coordinates.latitude.toFixed(4)},{' '}
            {coordinates.longitude.toFixed(4)}
          </span>
        </div>
      )}

      {/* Mobile Layout - Search + Filter Button */}
      <div className='flex gap-2 md:hidden'>
        <SearchInput
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder={t('searchPlaceholder')}
          className='flex-1'
        />
        <Button
          variant='outline'
          className='h-9 px-3 relative'
          onClick={onOpenAdvanced}
        >
          <Filter className='h-4 w-4' />
          {typeof activeCount === 'number' && activeCount > 0 && (
            <span className='absolute -top-1 -right-1 bg-destructive text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full'>
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* Desktop Layout - Full Filter Bar */}
      <div className='hidden md:block space-y-3'>
        <div className='flex flex-col md:flex-row gap-3 items-stretch'>
          <div className='flex-1 flex items-center gap-3'>
            <SearchInput
              value={search}
              onChange={(v) => setSearch(v)}
              placeholder={t('searchPlaceholder')}
              className='flex-1'
            />
            <Button
              variant='destructive'
              className='h-9 px-6'
              onClick={handleApply}
            >
              {t('actions.search')}
            </Button>
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
            {typeof activeCount === 'number' && activeCount > 0 && (
              <span className='absolute -top-1 -right-1 bg-destructive text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full'>
                {activeCount}
              </span>
            )}
          </Button>
          <PropertyTypeDropdown
            value={propertyType}
            onChange={(v) => setPropertyType(v)}
          />
          <PriceRangeDropdown
            minPrice={minPrice}
            maxPrice={maxPrice}
            onChange={(min, max) => {
              setMinPrice(min)
              setMaxPrice(max)
            }}
          />
          <AreaRangeDropdown
            minArea={minArea}
            maxArea={maxArea}
            onChange={(min, max) => {
              setMinArea(min)
              setMaxArea(max)
            }}
          />
          <div className='flex items-center gap-4 ml-2'>
            <div className='flex items-center gap-1'>
              <Switch
                size='sm'
                checked={verified}
                onCheckedChange={setVerified}
              />
              <span className='text-sm flex items-center gap-1'>
                <ShieldCheck className='h-3.5 w-3.5 text-muted-foreground' />
                {t('toggles.verified')}
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <Switch
                size='sm'
                checked={professional}
                onCheckedChange={setProfessional}
              />
              <span className='text-sm flex items-center gap-1'>
                <Briefcase className='h-3.5 w-3.5 text-muted-foreground' />
                {t('toggles.professionalBroker')}
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <LocationSwitch />
            </div>
          </div>
          <Button
            variant='ghost'
            size='sm'
            className='ml-auto h-9'
            onClick={handleClear}
          >
            {t('actions.clear')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResidentialFilterBar
