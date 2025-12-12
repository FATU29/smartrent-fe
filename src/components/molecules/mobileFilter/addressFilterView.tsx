import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  useLegacyProvinces,
  useLegacyDistrictsInfinite,
  useLegacyWardsInfinite,
  useNewProvinces,
  useNewWardsInfinite,
} from '@/hooks/useAddress'
import CascadeSelectField from '@/components/atoms/cascadeSelectField'
import { Switch } from '@/components/atoms/switch'
import { useListContext } from '@/contexts/list/useListContext'
import { ListingFilterRequest } from '@/api/types/property.type'

interface AddressFilterViewProps {
  value?: ListingFilterRequest
  onChange?: (partial: Partial<ListingFilterRequest>) => void
}

type ChangeHandler = (partial: Partial<ListingFilterRequest>) => void

type AddressSectionProps = {
  value: ListingFilterRequest
  onChange: ChangeHandler
  t: ReturnType<typeof useTranslations<'residentialFilter.areaProject'>>
}

const mapPagedDataToOptions = <T,>(
  pages: { data: readonly T[] }[] | undefined,
  getId: (item: T) => string | number | null | undefined,
  getLabel: (item: T) => string,
) => {
  const seen = new Set<string>()
  return (
    pages
      ?.flatMap((page) => page?.data ?? [])
      ?.reduce<Array<{ id: string; label: string }>>((list, entry) => {
        const id = getId(entry)
        if (id === null || id === undefined) {
          return list
        }
        const key = String(id)
        if (seen.has(key)) {
          return list
        }
        seen.add(key)
        list.push({ id: key, label: getLabel(entry) })
        return list
      }, []) ?? []
  )
}

const AddressFilterView: React.FC<AddressFilterViewProps> = ({
  value: propValue,
  onChange: propOnChange,
}) => {
  const t = useTranslations('residentialFilter.areaProject')
  const { filters: contextFilters, updateFilters: updateContextFilters } =
    useListContext()

  const value = propValue ?? contextFilters
  const emitChange = propOnChange ?? updateContextFilters

  const isLegacy = value.isLegacy !== false

  const handleStructureToggle = (checked: boolean) => {
    emitChange({
      isLegacy: !checked,
      provinceId: undefined,
      districtId: undefined,
      wardId: undefined,
      latitude: undefined,
      longitude: undefined,
    })
  }

  return (
    <div className='p-4'>
      <div className='mb-4 space-y-3'>
        <h2 className='text-base font-semibold'>{t('title')}</h2>
        <div className='flex items-center justify-between rounded-lg bg-muted py-2 px-3'>
          <div className='flex flex-col'>
            <span className='text-sm font-medium'>
              {isLegacy
                ? t('structureToggle.legacyTitle', {
                    count: 63,
                  })
                : t('structureToggle.newTitle', {
                    count: 34,
                  })}
            </span>
            <span className='text-xs text-muted-foreground'>
              {isLegacy
                ? t('structureToggle.legacyLevels')
                : t('structureToggle.newLevels')}
            </span>
          </div>
          <Switch checked={!isLegacy} onCheckedChange={handleStructureToggle} />
        </div>
      </div>

      {isLegacy ? (
        <LegacyAddressSection value={value} onChange={emitChange} t={t} />
      ) : (
        <NewAddressSection value={value} onChange={emitChange} t={t} />
      )}
    </div>
  )
}

const LegacyAddressSection: React.FC<AddressSectionProps> = ({
  value,
  onChange,
  t,
}) => {
  const legacyProvinceId =
    typeof value.provinceId === 'number' ? value.provinceId : undefined
  const legacyDistrictId =
    typeof value.districtId === 'number' ? value.districtId : undefined

  const { data: legacyProvincesData, isLoading: legacyProvincesLoading } =
    useLegacyProvinces()
  const legacyDistrictsQuery = useLegacyDistrictsInfinite(legacyProvinceId)
  const legacyWardsQuery = useLegacyWardsInfinite(legacyDistrictId)

  const provinces = useMemo(
    () =>
      (legacyProvincesData ?? []).map((province) => ({
        id: String(province.id),
        label: province.name,
      })),
    [legacyProvincesData],
  )

  const districts = useMemo(
    () =>
      mapPagedDataToOptions(
        legacyDistrictsQuery.data?.pages,
        (district) => district.id,
        (district) => district.name,
      ),
    [legacyDistrictsQuery.data?.pages],
  )

  const wards = useMemo(
    () =>
      mapPagedDataToOptions(
        legacyWardsQuery.data?.pages,
        (ward) => ward.id,
        (ward) => ward.name,
      ),
    [legacyWardsQuery.data?.pages],
  )

  return (
    <div className='space-y-5'>
      <CascadeSelectField
        label={t('province')}
        placeholder={t('chooseProvince')}
        value={legacyProvinceId ? String(legacyProvinceId) : undefined}
        options={provinces}
        onChange={(id) => {
          onChange({
            isLegacy: true,
            provinceId: id ? Number(id) : undefined,
            districtId: undefined,
            wardId: undefined,
            latitude: undefined,
            longitude: undefined,
          })
        }}
        disabled={legacyProvincesLoading}
        searchable
      />

      <CascadeSelectField
        label={t('district')}
        placeholder={t('chooseDistrict')}
        value={legacyDistrictId ? String(legacyDistrictId) : undefined}
        options={districts}
        onChange={(id) => {
          onChange({
            isLegacy: true,
            districtId: id ? Number(id) : undefined,
            wardId: undefined,
            latitude: undefined,
            longitude: undefined,
          })
        }}
        disabled={!legacyProvinceId || legacyDistrictsQuery.isLoading}
        searchable
        onLoadMore={
          legacyDistrictsQuery.hasNextPage &&
          !legacyDistrictsQuery.isFetchingNextPage
            ? () => legacyDistrictsQuery.fetchNextPage()
            : undefined
        }
        hasMore={!!legacyDistrictsQuery.hasNextPage}
        isLoadingMore={legacyDistrictsQuery.isFetchingNextPage}
      />

      <CascadeSelectField
        label={t('ward')}
        placeholder={t('chooseWard')}
        value={value.wardId ? String(value.wardId) : undefined}
        options={wards}
        onChange={(id) => {
          onChange({
            isLegacy: true,
            wardId: id ? Number(id) : undefined,
            latitude: undefined,
            longitude: undefined,
          })
        }}
        disabled={!legacyDistrictId || legacyWardsQuery.isLoading}
        searchable
        onLoadMore={
          legacyWardsQuery.hasNextPage && !legacyWardsQuery.isFetchingNextPage
            ? () => legacyWardsQuery.fetchNextPage()
            : undefined
        }
        hasMore={!!legacyWardsQuery.hasNextPage}
        isLoadingMore={legacyWardsQuery.isFetchingNextPage}
      />
    </div>
  )
}

const NewAddressSection: React.FC<AddressSectionProps> = ({
  value,
  onChange,
  t,
}) => {
  const newProvinceCode =
    typeof value.provinceId === 'string' ? value.provinceId : undefined

  const { data: newProvincesData, isLoading: newProvincesLoading } =
    useNewProvinces()
  const newWardsQuery = useNewWardsInfinite(newProvinceCode)

  const provinces = useMemo(
    () =>
      (newProvincesData ?? []).map((province) => ({
        id: String(province.key),
        label: province.name,
      })),
    [newProvincesData],
  )

  const wards = useMemo(
    () =>
      mapPagedDataToOptions(
        newWardsQuery.data?.pages,
        (ward) => ward.code,
        (ward) => ward.name,
      ),
    [newWardsQuery.data?.pages],
  )

  return (
    <div className='space-y-5'>
      <CascadeSelectField
        label={t('province')}
        placeholder={t('chooseProvince')}
        value={newProvinceCode}
        options={provinces}
        onChange={(code) => {
          onChange({
            isLegacy: false,
            provinceId: code || undefined,
            districtId: undefined,
            wardId: undefined,
            latitude: undefined,
            longitude: undefined,
          })
        }}
        disabled={newProvincesLoading}
        searchable
      />

      <CascadeSelectField
        label={t('ward')}
        placeholder={t('chooseWard')}
        value={typeof value.wardId === 'string' ? value.wardId : undefined}
        options={wards}
        onChange={(code) => {
          onChange({
            isLegacy: false,
            wardId: code || undefined,
            latitude: undefined,
            longitude: undefined,
          })
        }}
        disabled={!newProvinceCode || newWardsQuery.isLoading}
        searchable
        onLoadMore={
          newWardsQuery.hasNextPage && !newWardsQuery.isFetchingNextPage
            ? () => newWardsQuery.fetchNextPage()
            : undefined
        }
        hasMore={!!newWardsQuery.hasNextPage}
        isLoadingMore={newWardsQuery.isFetchingNextPage}
      />

      <div className='rounded-lg bg-blue-50 p-3 text-sm text-muted-foreground dark:bg-blue-950'>
        💡{' '}
        {t('structureToggle.newDescription', {
          count: provinces.length,
        })}
      </div>
    </div>
  )
}

export default AddressFilterView
