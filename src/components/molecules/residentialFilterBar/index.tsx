import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
} from 'react'
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
import { useRouter } from 'next/router'
import { pushQueryParams } from '@/utils/queryParams'

interface ResidentialFilterBarProps {
  onSearch?: (query: string) => void
  onFiltersChange?: (filters: ListFilters) => void
  onPendingChange?: (partial: Partial<ListFilters>) => void
  onClear?: () => void
  value?: ListFilters // controlled filters (optional)
  activeCount?: number
  onOpenAdvanced?: () => void // opens the new unified dialog
}

export interface ResidentialFilterBarRef {
  triggerApply: () => void
  getPending: () => Partial<ListFilters>
  setPending: (partial: Partial<ListFilters>) => void
}

const ResidentialFilterBar = forwardRef<
  ResidentialFilterBarRef,
  ResidentialFilterBarProps
>(
  (
    {
      onSearch,
      onFiltersChange,
      onPendingChange,
      onClear,
      value,
      activeCount,
      onOpenAdvanced,
    },
    ref,
  ) => {
    const t = useTranslations('residentialFilter')
    const tActions = useTranslations('residentialFilter.actions')
    useLocation() // keep hook subscription if needed elsewhere; no direct usage here
    const router = useRouter()

    // Local state for UI (doesn't trigger API until Apply is clicked)
    const [search, setSearch] = useState(value?.search || '')
    const [propertyType, setPropertyType] = useState<string>(
      value?.propertyType || 'any',
    )
    const [minPrice, setMinPrice] = useState<number | undefined>(
      value?.minPrice,
    )
    const [maxPrice, setMaxPrice] = useState<number | undefined>(
      value?.maxPrice,
    )
    const [minArea, setMinArea] = useState<number | undefined>(value?.minArea)
    const [maxArea, setMaxArea] = useState<number | undefined>(value?.maxArea)
    const [verified, setVerified] = useState<boolean>(!!value?.verified)
    const [professional, setProfessional] = useState<boolean>(
      !!value?.professionalBroker,
    )
    const [bedrooms, setBedrooms] = useState<number | undefined>(
      value?.bedrooms,
    )
    const [bathrooms, setBathrooms] = useState<number | undefined>(
      value?.bathrooms,
    )
    // Store pending extended filters from dialog (orientation, amenities, address, etc.)
    const [pendingExtended, setPendingExtended] = useState<
      Partial<ListFilters>
    >({})

    // Sync with external value changes (from URL or context)
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
      setBedrooms(value.bedrooms)
      setBathrooms(value.bathrooms)
      // Sync extended filters from value (from URL or context)
      setPendingExtended(value)
    }, [value])

    const handleApply = () => {
      const filters: Partial<ListFilters> = {
        propertyType: propertyType === 'any' ? undefined : propertyType,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        verified,
        professionalBroker: professional,
        search,
        bedrooms,
        bathrooms,
        page: 1,
      }
      onFiltersChange?.(filters as ListFilters)
      onSearch?.(search)

      // Merge: value from context + pendingExtended from dialog
      const fullFilters: ListFilters = {
        ...(value || {}),
        ...pendingExtended,
      } as ListFilters

      // Push all filter fields to URL
      pushQueryParams(
        router,
        {
          // Basic filters (from bar UI)
          category:
            propertyType && propertyType !== 'any'
              ? String(propertyType).toLowerCase()
              : null,
          search: search || null,
          minPrice: minPrice ?? null,
          maxPrice: maxPrice ?? null,
          minArea: minArea ?? null,
          maxArea: maxArea ?? null,
          bedrooms: bedrooms ?? null,
          bathrooms: bathrooms ?? null,
          verified: verified || null,
          professionalBroker: professional || null,

          // Extended filters (from dialog)
          orientation: fullFilters.orientation ?? null,
          moveInTime: fullFilters.moveInTime ?? null,
          electricityPrice: fullFilters.electricityPrice ?? null,
          waterPrice: fullFilters.waterPrice ?? null,
          internetPrice: fullFilters.internetPrice ?? null,
          minFrontage: fullFilters.minFrontage ?? null,
          maxFrontage: fullFilters.maxFrontage ?? null,
          hasVideo: fullFilters.hasVideo || null,
          has360: fullFilters.has360 || null,
          amenities:
            fullFilters.amenities && fullFilters.amenities.length > 0
              ? fullFilters.amenities.map((a) => a.id).join(',')
              : null,

          // Address filters - Use addressType flag to determine structure
          addressType: fullFilters.addressStructureType ?? null,
          // Legacy structure fields
          province: fullFilters.province ?? null,
          district: fullFilters.district ?? null,
          ward: fullFilters.ward ?? null,
          // New structure fields
          newProvinceCode: fullFilters.newProvinceCode ?? null,
          newWardCode: fullFilters.newWardCode ?? null,
          // Common address fields
          streetId: fullFilters.streetId ?? null,
          projectId: fullFilters.projectId ?? null,

          page: null,
        },
        { shallow: true },
      )
    }

    // Expose triggerApply to parent via ref
    useImperativeHandle(ref, () => ({
      triggerApply: handleApply,
      getPending: () => ({
        propertyType: propertyType === 'any' ? undefined : propertyType,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        verified,
        professionalBroker: professional,
        search,
        bedrooms,
        bathrooms,
      }),
      setPending: (partial: Partial<ListFilters>) => {
        // Update bar's basic filter states
        if (partial.search !== undefined) setSearch(partial.search || '')
        if (partial.propertyType !== undefined)
          setPropertyType(partial.propertyType || 'any')
        if (partial.minPrice !== undefined) setMinPrice(partial.minPrice)
        if (partial.maxPrice !== undefined) setMaxPrice(partial.maxPrice)
        if (partial.minArea !== undefined) setMinArea(partial.minArea)
        if (partial.maxArea !== undefined) setMaxArea(partial.maxArea)
        if (partial.verified !== undefined) setVerified(!!partial.verified)
        if (partial.professionalBroker !== undefined)
          setProfessional(!!partial.professionalBroker)
        if (partial.bedrooms !== undefined) setBedrooms(partial.bedrooms)
        if (partial.bathrooms !== undefined) setBathrooms(partial.bathrooms)

        // Store all extended filters (orientation, amenities, address, etc.) to merge later
        setPendingExtended((prev) => ({ ...prev, ...partial }))
      },
    }))

    // Note: Clear button removed from desktop bar per requirement. Any resets should be triggered from the dialog wrapper (onClear).

    const handleSearchPendingChange = useCallback(
      (v: string) => {
        setSearch(v)
        onPendingChange?.({ search: v })
      },
      [onPendingChange],
    )

    return (
      <div className='w-full space-y-3'>
        {/* Location enabled banner with coordinates removed per requirement */}

        {/* Mobile Layout */}
        <div className='md:hidden flex flex-col gap-2'>
          {/* Row 1: Search + Filter */}
          <div className='flex gap-2'>
            <SearchInput
              value={search}
              onChange={handleSearchPendingChange}
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
            {onClear && (
              <Button
                variant='outline'
                className='h-9 px-3 flex-1'
                type='button'
                onClick={onClear}
              >
                {tActions('reset')}
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Layout - Full Filter Bar */}
        <div className='hidden md:block space-y-3'>
          <div className='flex flex-col md:flex-row gap-3 items-stretch'>
            <div className='flex-1 flex items-center gap-3'>
              <SearchInput
                value={search}
                onChange={handleSearchPendingChange}
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
              {typeof activeCount === 'number' && activeCount > 0 && (
                <span className='absolute -top-1 -right-1 bg-destructive text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full'>
                  {activeCount}
                </span>
              )}
            </Button>
            <PropertyTypeDropdown
              value={propertyType}
              onChange={(v) => {
                setPropertyType(v)
                onPendingChange?.({
                  propertyType: v === 'any' ? undefined : v,
                })
              }}
            />
            <PriceRangeDropdown
              minPrice={minPrice}
              maxPrice={maxPrice}
              onChange={(min, max) => {
                setMinPrice(min)
                setMaxPrice(max)
                onPendingChange?.({ minPrice: min, maxPrice: max })
              }}
            />
            <AreaRangeDropdown
              minArea={minArea}
              maxArea={maxArea}
              onChange={(min, max) => {
                setMinArea(min)
                setMaxArea(max)
                onPendingChange?.({ minArea: min, maxArea: max })
              }}
            />
            <div className='flex items-center gap-4 ml-2'>
              <div className='flex items-center gap-1'>
                <Switch
                  size='sm'
                  checked={verified}
                  onCheckedChange={(v) => {
                    setVerified(v)
                    onPendingChange?.({ verified: v })
                  }}
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
                  onCheckedChange={(v) => {
                    setProfessional(v)
                    onPendingChange?.({ professionalBroker: v })
                  }}
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
            {onClear && (
              <Button
                variant='outline'
                className='h-9 px-4'
                type='button'
                onClick={onClear}
              >
                {tActions('reset')}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  },
)

ResidentialFilterBar.displayName = 'ResidentialFilterBar'

export default ResidentialFilterBar
