import React, { useCallback, useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Combobox from '@/components/atoms/combobox'
import { Switch } from '@/components/atoms/switch'
import { AddressService } from '@/api/services/address.service'
import { toast } from 'sonner'
import {
  useLegacyProvinces,
  useLegacyDistricts,
  useLegacyWards,
  useLegacyStreets,
  useLegacyProjects,
  useNewProvinces,
  useNewWards,
  useSearchStreets,
} from '@/hooks/useAddress/useAddressQueries'
import type {
  NewProvince,
  NewWard,
  Project,
  StreetExtended,
} from '@/api/types/address.type'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagedList, type Option } from './usePagedList'

export interface AddressFilterData {
  province?: string
  district?: string
  ward?: string
  newProvinceCode?: string
  newWardCode?: string
  streetId?: string
  projectId?: string
  addressStructureType?: 'legacy' | 'new'
  searchAddress?: string
  addressEdited?: boolean
}

export interface AddressInputProps {
  className?: string
  value: AddressFilterData
  onChange: (data: Partial<AddressFilterData>) => void
}

export const AddressInput: React.FC<AddressInputProps> = ({
  className,
  value,
  onChange,
}) => {
  const tAddress = useTranslations('createPost.sections.propertyInfo.address')

  const isLegacy = useMemo(() => {
    return value?.addressStructureType !== 'new'
  }, [value?.addressStructureType])

  const {
    data: legacyProvinces = [],
    isLoading: loadingLegacyProvinces,
    isFetching: fetchingLegacyProvinces,
    error: errorLegacyProvinces,
  } = useLegacyProvinces()

  const selectedLegacyProvinceId = useMemo(() => {
    const id = parseInt(value?.province || '0')
    return id > 0 ? id : undefined
  }, [value?.province])

  const {
    data: legacyDistricts = [],
    isLoading: loadingLegacyDistricts,
    isFetching: fetchingLegacyDistricts,
    error: errorLegacyDistricts,
  } = useLegacyDistricts(selectedLegacyProvinceId)

  const selectedLegacyDistrictId = useMemo(() => {
    const id = parseInt(value?.district || '0')
    return id > 0 ? id : undefined
  }, [value?.district])

  const {
    data: legacyWards = [],
    isLoading: loadingLegacyWards,
    isFetching: fetchingLegacyWards,
    error: errorLegacyWards,
  } = useLegacyWards(selectedLegacyDistrictId)

  const selectedLegacyWardId = undefined

  const {
    data: legacyStreets = [],
    isLoading: loadingLegacyStreets,
    isFetching: fetchingLegacyStreets,
  } = useLegacyStreets(
    undefined,
    selectedLegacyDistrictId,
    selectedLegacyProvinceId,
  )

  const {
    data: legacyProjects = [],
    isLoading: loadingLegacyProjects,
    isFetching: fetchingLegacyProjects,
  } = useLegacyProjects(selectedLegacyProvinceId, selectedLegacyDistrictId)

  const {
    data: newProvinces = [],
    isLoading: loadingNewProvinces,
    isFetching: fetchingNewProvinces,
    error: errorNewProvinces,
  } = useNewProvinces()

  const {
    data: newWards = [],
    isLoading: loadingNewWards,
    isFetching: fetchingNewWards,
    error: errorNewWards,
  } = useNewWards(value?.newProvinceCode)

  const [derivedLegacyIds, setDerivedLegacyIds] = React.useState<{
    provinceId?: number
    districtId?: number
    wardId?: number
  }>({})

  React.useEffect(() => {
    let cancelled = false
    const convert = async () => {
      if (!value?.newProvinceCode || !value?.newWardCode) {
        if (!cancelled) setDerivedLegacyIds({})
        return
      }
      try {
        const res = await AddressService.convertNewToLegacy(
          value.newProvinceCode,
          value.newWardCode,
        )
        const legacy = res?.data?.data?.legacyAddress
        if (legacy && !cancelled) {
          setDerivedLegacyIds({
            provinceId: legacy.province?.id,
            districtId: legacy.district?.id,
            wardId: legacy.ward?.id,
          })
        }
      } catch {
        if (!cancelled) setDerivedLegacyIds({})
      }
    }
    convert()
    return () => {
      cancelled = true
    }
  }, [value?.newProvinceCode, value?.newWardCode])

  const {
    data: newModeStreets = [],
    isLoading: loadingNewModeStreets,
    isFetching: fetchingNewModeStreets,
  } = useLegacyStreets(undefined, derivedLegacyIds.districtId, undefined)

  const {
    data: newModeProjects = [],
    isLoading: loadingNewModeProjects,
    isFetching: fetchingNewModeProjects,
  } = useLegacyProjects(
    derivedLegacyIds.provinceId,
    derivedLegacyIds.districtId,
  )

  React.useEffect(() => {
    if (errorLegacyProvinces || errorNewProvinces) {
      toast.error(tAddress('errors.loadProvincesFailed'))
    }
    if (errorLegacyDistricts) {
      toast.error(tAddress('errors.loadDistrictsFailed'))
    }
    if (errorLegacyWards || errorNewWards) {
      toast.error(tAddress('errors.loadWardsFailed'))
    }
  }, [
    errorLegacyProvinces,
    errorLegacyDistricts,
    errorLegacyWards,
    errorNewProvinces,
    errorNewWards,
    tAddress,
  ])

  const legacyToNewConversionRef = React.useRef<string>('')
  const newToLegacyConversionRef = React.useRef<string>('')

  React.useEffect(() => {
    const provinceId = parseInt(value.province || '0')
    const districtId = parseInt(value.district || '0')
    const wardId = parseInt(value.ward || '0')

    const conversionKey = `${provinceId}-${districtId}-${wardId}`

    if (
      isLegacy &&
      provinceId > 0 &&
      districtId > 0 &&
      wardId > 0 &&
      legacyToNewConversionRef.current !== conversionKey
    ) {
      legacyToNewConversionRef.current = conversionKey
      AddressService.convertLegacyToNew(provinceId, districtId, wardId)
        .then((response) => {
          if (response?.data?.data?.newAddress) {
            const { newAddress } = response.data.data
            onChange({
              ...value,
              newProvinceCode: newAddress.province.code,
              newWardCode: newAddress.ward?.code || '',
            })
            toast.success(tAddress('convert.autoConvertSuccess'))
          }
        })
        .catch(() => {
          legacyToNewConversionRef.current = ''
        })
    }
  }, [isLegacy, value.province, value.district, value.ward])

  React.useEffect(() => {
    const provinceCode = value.newProvinceCode || ''
    const wardCode = value.newWardCode || ''

    const conversionKey = `${provinceCode}-${wardCode}`

    if (
      !isLegacy &&
      provinceCode &&
      wardCode &&
      newToLegacyConversionRef.current !== conversionKey
    ) {
      newToLegacyConversionRef.current = conversionKey
      AddressService.convertNewToLegacy(provinceCode, wardCode)
        .then((response) => {
          if (response?.data?.data?.legacyAddress) {
            const { legacyAddress } = response.data.data
            onChange({
              ...value,
              province: legacyAddress.province.id.toString(),
              district: legacyAddress.district?.id.toString() || '',
              ward: legacyAddress.ward?.id.toString() || '',
            })
            toast.success(tAddress('convert.autoConvertSuccess'))
          }
        })
        .catch(() => {
          newToLegacyConversionRef.current = ''
        })
    }
  }, [isLegacy, value.newProvinceCode, value.newWardCode])

  const handleStructureTypeChange = useCallback(
    (checked: boolean) => {
      const newType = checked ? 'new' : 'legacy'
      onChange({
        ...value,
        addressStructureType: newType,
      })
    },
    [value, onChange],
  )

  type LegacyProvinceItem = {
    provinceId?: number
    id?: number
    code?: string
    name?: string
  }

  const legacyProvinceOptions: Option[] = useMemo(() => {
    const list = (
      Array.isArray(legacyProvinces)
        ? (legacyProvinces as LegacyProvinceItem[])
        : []
    ) as LegacyProvinceItem[]
    return list
      .filter((p) => (p?.provinceId ?? p?.id ?? p?.code) && p?.name)
      .map((p) => {
        const pid = p?.id ?? p?.provinceId ?? p?.code
        return { value: String(pid), label: p.name! } as Option
      })
  }, [legacyProvinces])

  type LegacyDistrictItem = { districtId?: number; id?: number; name?: string }
  const legacyDistrictOptions: Option[] = useMemo(() => {
    const list = (
      Array.isArray(legacyDistricts)
        ? (legacyDistricts as LegacyDistrictItem[])
        : []
    ) as LegacyDistrictItem[]
    return list
      .filter((d) => (d?.districtId ?? d?.id) && d?.name)
      .map((d) => {
        const did = d?.districtId ?? d?.id
        return { value: String(did), label: d.name! } as Option
      })
  }, [legacyDistricts])

  type LegacyWardItem = { wardId?: number; id?: number; name?: string }
  const legacyWardOptions: Option[] = useMemo(() => {
    const list = (
      Array.isArray(legacyWards) ? (legacyWards as LegacyWardItem[]) : []
    ) as LegacyWardItem[]
    return list
      .filter((w) => (w?.wardId ?? w?.id) && w?.name)
      .map((w) => {
        const wid = w?.wardId ?? w?.id
        return { value: String(wid), label: w.name! } as Option
      })
  }, [legacyWards])

  type LegacyStreetItem = { streetId?: number; id?: number; name?: string }
  const legacyStreetOptions: Option[] = useMemo(() => {
    const list = (
      Array.isArray(legacyStreets) ? (legacyStreets as LegacyStreetItem[]) : []
    ) as LegacyStreetItem[]
    return list
      .filter((s) => (s?.streetId ?? s?.id) && s?.name)
      .map((s) => {
        const sid = s?.streetId ?? s?.id
        return { value: String(sid), label: s.name! } as Option
      })
  }, [legacyStreets])

  type LegacyProjectItem = Project & { projectId?: number }
  const legacyProjectOptions: Option[] = useMemo(() => {
    const list = (
      Array.isArray(legacyProjects)
        ? (legacyProjects as LegacyProjectItem[])
        : []
    ) as LegacyProjectItem[]
    return list
      .filter((p) => (p?.id ?? p?.projectId) && p?.name)
      .map((p) => ({
        value: String(p.id ?? p.projectId),
        label: p.name,
      }))
  }, [legacyProjects])

  const newProvinceOptions: Option[] = useMemo(
    () =>
      (newProvinces || [])
        .filter((p: NewProvince) => p?.code && p?.name)
        .map((p: NewProvince) => ({
          value: p.code,
          label: p.name,
        })),
    [newProvinces],
  )

  const newWardOptions: Option[] = useMemo(
    () =>
      (newWards || [])
        .filter((w: NewWard) => w?.code && w?.name)
        .map((w: NewWard) => ({
          value: w.code,
          label: w.name,
        })),
    [newWards],
  )

  const newModeStreetOptions: Option[] = useMemo(() => {
    const list = Array.isArray(newModeStreets)
      ? (newModeStreets as readonly StreetExtended[])
      : []
    return list
      .filter((s) => s?.streetId && s?.name)
      .map((s) => ({ value: String(s.streetId), label: s.name }))
  }, [newModeStreets])

  const newModeProjectOptions: Option[] = useMemo(() => {
    const list = Array.isArray(newModeProjects)
      ? (newModeProjects as readonly Project[])
      : []
    return list
      .filter((p) => (p as Project)?.id && p?.name)
      .map((p) => ({ value: String((p as Project).id), label: p.name }))
  }, [newModeProjects])

  const [legacyStreetSearch, setLegacyStreetSearch] = React.useState('')
  const debouncedLegacyStreetSearch = useDebounce(legacyStreetSearch, 250)
  const [newStreetSearch, setNewStreetSearch] = React.useState('')
  const debouncedNewStreetSearch = useDebounce(newStreetSearch, 250)

  const { data: legacySearchStreets = [], isFetching: fetchingLegacySearch } =
    useSearchStreets(
      debouncedLegacyStreetSearch,
      selectedLegacyProvinceId,
      selectedLegacyDistrictId,
    )

  const { data: newModeSearchStreets = [], isFetching: fetchingNewModeSearch } =
    useSearchStreets(
      debouncedNewStreetSearch,
      derivedLegacyIds.provinceId,
      derivedLegacyIds.districtId,
    )

  const streetIdOf = (
    s: Partial<StreetExtended> & { id?: number },
  ): number | undefined => s.streetId ?? s.id

  const legacySearchStreetOptions: Option[] = useMemo(() => {
    const list = Array.isArray(legacySearchStreets)
      ? (legacySearchStreets as readonly StreetExtended[])
      : []
    return list
      .filter(
        (s: Partial<StreetExtended> & { id?: number; name?: string }) =>
          Boolean(streetIdOf(s)) && Boolean(s?.name),
      )
      .map((s: Partial<StreetExtended> & { id?: number; name?: string }) => ({
        value: String(streetIdOf(s)!),
        label: String(s?.name ?? ''),
      }))
  }, [legacySearchStreets])

  const newModeSearchStreetOptions: Option[] = useMemo(() => {
    const list = Array.isArray(newModeSearchStreets)
      ? (newModeSearchStreets as readonly StreetExtended[])
      : []
    return list
      .filter(
        (s: Partial<StreetExtended> & { id?: number; name?: string }) =>
          Boolean(streetIdOf(s)) && Boolean(s?.name),
      )
      .map((s: Partial<StreetExtended> & { id?: number; name?: string }) => ({
        value: String(streetIdOf(s)!),
        label: String(s?.name ?? ''),
      }))
  }, [newModeSearchStreets])

  const legacyStreetPager = usePagedList(legacyStreetOptions)
  const legacyStreetSearchPager = usePagedList(legacySearchStreetOptions)
  const legacyProjectPager = usePagedList(legacyProjectOptions)

  const newModeStreetPager = usePagedList(newModeStreetOptions)
  const newModeStreetSearchPager = usePagedList(newModeSearchStreetOptions)
  const newModeProjectPager = usePagedList(newModeProjectOptions)

  React.useEffect(() => {
    if (value?.addressEdited) return

    const findLabel = (opts: Option[], val?: string) =>
      opts.find((o) => o.value === (val || ''))?.label

    const parts: string[] = []

    if (isLegacy) {
      const projectLabel = findLabel(legacyProjectOptions, value?.projectId)
      if (projectLabel) parts.push(projectLabel)

      const streetLabel = findLabel(legacyStreetOptions, value?.streetId)
      if (streetLabel) parts.push(streetLabel)

      const wardLabel = findLabel(legacyWardOptions, value?.ward)
      if (wardLabel) parts.push(wardLabel)
      const districtLabel = findLabel(legacyDistrictOptions, value?.district)
      if (districtLabel) parts.push(districtLabel)
      const provinceLabel = findLabel(legacyProvinceOptions, value?.province)
      if (provinceLabel) parts.push(provinceLabel)
    } else {
      const projectLabel = findLabel(newModeProjectOptions, value?.projectId)
      if (projectLabel) parts.push(projectLabel)

      const streetLabel = findLabel(newModeStreetOptions, value?.streetId)
      if (streetLabel) parts.push(streetLabel)

      const wardLabel = findLabel(newWardOptions, value?.newWardCode)
      if (wardLabel) parts.push(wardLabel)
      const provinceLabel = findLabel(
        newProvinceOptions,
        value?.newProvinceCode,
      )
      if (provinceLabel) parts.push(provinceLabel)
    }

    const composed = parts.join(', ')
    if (composed && composed !== value?.searchAddress) {
      onChange({ ...value, searchAddress: composed })
    }
  }, [
    value?.addressEdited,
    isLegacy,
    value?.projectId,
    value?.streetId,
    value?.ward,
    value?.district,
    value?.province,
    value?.newProvinceCode,
    value?.newWardCode,
    legacyProjectOptions,
    legacyStreetOptions,
    legacyWardOptions,
    legacyDistrictOptions,
    legacyProvinceOptions,
    newProvinceOptions,
    newWardOptions,
    newModeProjectOptions,
    newModeStreetOptions,
  ])

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Structure Type Toggle */}
      <div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
        <div className='flex items-center gap-3'>
          <MapPin className='w-4 h-4 text-gray-500' />
          <div>
            <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
              {tAddress('structureType.label')}
            </label>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {isLegacy
                ? tAddress('structureType.legacyDescription')
                : tAddress('structureType.newDescription')}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <span
            className={`text-xs font-medium ${
              !isLegacy ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {tAddress('structureType.legacy')}
          </span>
          <Switch
            checked={!isLegacy}
            onCheckedChange={handleStructureTypeChange}
            size='sm'
          />
          <span
            className={`text-xs font-medium ${
              isLegacy ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {tAddress('structureType.new')}
          </span>
        </div>
      </div>

      {/* Legacy Structure (63 provinces) */}
      {isLegacy && (
        <div className='space-y-3'>
          <Combobox
            label={tAddress('province')}
            value={value?.province || undefined}
            onValueChange={(val: string) => {
              onChange({
                ...value,
                province: val,
                district: '',
                ward: '',
                streetId: '',
                projectId: '',
              })
            }}
            options={legacyProvinceOptions}
            disabled={loadingLegacyProvinces}
            loading={fetchingLegacyProvinces}
            placeholder={
              loadingLegacyProvinces
                ? tAddress('loading.provinces')
                : tAddress('placeholders.selectProvince')
            }
            searchable={true}
            searchPlaceholder={
              tAddress('placeholders.searchProvince') ||
              'Tìm kiếm tỉnh/thành...'
            }
            emptyText={tAddress('empty.noResults')}
            noOptionsText={tAddress('empty.noOptions')}
          />
          <Combobox
            label={tAddress('district')}
            value={value?.district || undefined}
            onValueChange={(val: string) => {
              onChange({
                ...value,
                district: val,
                ward: '',
                streetId: '',
                projectId: '',
              })
            }}
            options={legacyDistrictOptions}
            disabled={loadingLegacyDistricts || !value?.province}
            loading={fetchingLegacyDistricts}
            placeholder={
              loadingLegacyDistricts
                ? tAddress('loading.districts')
                : tAddress('placeholders.selectDistrict')
            }
            searchable={true}
            searchPlaceholder={
              tAddress('placeholders.searchDistrict') ||
              'Tìm kiếm quận/huyện...'
            }
            emptyText={tAddress('empty.noResults')}
            noOptionsText={tAddress('empty.noOptions')}
          />
          <Combobox
            label={tAddress('ward')}
            value={value?.ward || undefined}
            onValueChange={(val: string) => {
              onChange({ ...value, ward: val, streetId: '' })
            }}
            options={legacyWardOptions}
            disabled={loadingLegacyWards || !value?.district}
            loading={fetchingLegacyWards}
            placeholder={
              loadingLegacyWards
                ? tAddress('loading.wards')
                : tAddress('placeholders.selectWard')
            }
            searchable={true}
            searchPlaceholder={
              tAddress('placeholders.searchWard') || 'Tìm kiếm phường/xã...'
            }
            emptyText={tAddress('empty.noResults')}
            noOptionsText={tAddress('empty.noOptions')}
          />
          <Combobox
            label={tAddress('street') || 'Đường phố'}
            value={value?.streetId || undefined}
            onValueChange={(val: string) => {
              onChange({ ...value, streetId: val })
            }}
            options={
              debouncedLegacyStreetSearch
                ? legacyStreetSearchPager.visible
                : legacyStreetPager.visible
            }
            disabled={
              (loadingLegacyStreets && !debouncedLegacyStreetSearch) ||
              (!debouncedLegacyStreetSearch &&
                !(selectedLegacyWardId || selectedLegacyDistrictId))
            }
            loading={fetchingLegacyStreets || fetchingLegacySearch}
            placeholder={
              loadingLegacyStreets
                ? tAddress('loading.streets') || 'Đang tải đường phố...'
                : tAddress('placeholders.selectStreet') || 'Chọn đường phố'
            }
            searchable={true}
            searchPlaceholder={
              tAddress('placeholders.searchStreet') || 'Tìm kiếm đường phố...'
            }
            onSearchChange={setLegacyStreetSearch}
            emptyText={tAddress('empty.noResults')}
            noOptionsText={tAddress('empty.noOptions')}
            hasMore={
              debouncedLegacyStreetSearch
                ? legacyStreetSearchPager.hasMore
                : legacyStreetPager.hasMore
            }
            onLoadMore={
              debouncedLegacyStreetSearch
                ? legacyStreetSearchPager.loadMore
                : legacyStreetPager.loadMore
            }
            isLoadingMore={
              debouncedLegacyStreetSearch
                ? legacyStreetSearchPager.isLoadingMore
                : legacyStreetPager.isLoadingMore
            }
          />
          <Combobox
            label={tAddress('project') || 'Dự án'}
            value={value?.projectId || undefined}
            onValueChange={(val: string) => {
              onChange({ ...value, projectId: val })
            }}
            options={legacyProjectPager.visible}
            disabled={
              loadingLegacyProjects || !(value?.district || value?.province)
            }
            loading={fetchingLegacyProjects}
            placeholder={
              loadingLegacyProjects
                ? tAddress('loading.projects') || 'Đang tải dự án...'
                : tAddress('placeholders.selectProject') || 'Chọn dự án'
            }
            searchable={true}
            searchPlaceholder={
              tAddress('placeholders.searchProject') || 'Tìm kiếm dự án...'
            }
            emptyText={tAddress('empty.noResults')}
            noOptionsText={tAddress('empty.noOptions')}
            hasMore={legacyProjectPager.hasMore}
            onLoadMore={legacyProjectPager.loadMore}
            isLoadingMore={legacyProjectPager.isLoadingMore}
          />
        </div>
      )}

      {/* New Structure (34 provinces) */}
      {!isLegacy && (
        <div className='space-y-3'>
          <Combobox
            label={tAddress('province')}
            value={value?.newProvinceCode || undefined}
            onValueChange={(val: string) => {
              onChange({
                ...value,
                newProvinceCode: val,
                newWardCode: '',
                streetId: '',
                projectId: '',
              })
            }}
            options={newProvinceOptions}
            disabled={loadingNewProvinces}
            loading={fetchingNewProvinces}
            placeholder={
              loadingNewProvinces
                ? tAddress('loading.provinces')
                : tAddress('placeholders.selectProvince')
            }
            searchable={true}
            searchPlaceholder={
              tAddress('placeholders.searchProvince') ||
              'Tìm kiếm tỉnh/thành...'
            }
            emptyText={tAddress('empty.noResults')}
            noOptionsText={tAddress('empty.noOptions')}
          />
          <Combobox
            label={tAddress('ward')}
            value={value?.newWardCode || undefined}
            onValueChange={(val: string) => {
              onChange({ ...value, newWardCode: val, streetId: '' })
            }}
            options={newWardOptions}
            disabled={loadingNewWards || !value?.newProvinceCode}
            loading={fetchingNewWards}
            placeholder={
              loadingNewWards
                ? tAddress('loading.wards')
                : tAddress('placeholders.selectWard')
            }
            searchable={true}
            searchPlaceholder={
              tAddress('placeholders.searchWard') || 'Tìm kiếm phường/xã...'
            }
            emptyText={tAddress('empty.noResults')}
            noOptionsText={tAddress('empty.noOptions')}
          />
          <Combobox
            label={tAddress('street') || 'Street'}
            value={value?.streetId || undefined}
            onValueChange={(val: string) => {
              onChange({ ...value, streetId: val })
            }}
            options={
              debouncedNewStreetSearch
                ? newModeStreetSearchPager.visible
                : newModeStreetPager.visible
            }
            disabled={
              (loadingNewModeStreets && !debouncedNewStreetSearch) ||
              (!debouncedNewStreetSearch && !derivedLegacyIds.districtId)
            }
            loading={fetchingNewModeStreets || fetchingNewModeSearch}
            placeholder={
              loadingNewModeStreets
                ? tAddress('loading.streets') || 'Loading streets...'
                : tAddress('placeholders.selectStreet') || 'Select street'
            }
            searchable={true}
            searchPlaceholder={
              tAddress('placeholders.searchStreet') || 'Search street...'
            }
            onSearchChange={setNewStreetSearch}
            emptyText={tAddress('empty.noResults')}
            noOptionsText={tAddress('empty.noOptions')}
            hasMore={
              debouncedNewStreetSearch
                ? newModeStreetSearchPager.hasMore
                : newModeStreetPager.hasMore
            }
            onLoadMore={
              debouncedNewStreetSearch
                ? newModeStreetSearchPager.loadMore
                : newModeStreetPager.loadMore
            }
            isLoadingMore={
              debouncedNewStreetSearch
                ? newModeStreetSearchPager.isLoadingMore
                : newModeStreetPager.isLoadingMore
            }
          />
          <Combobox
            label={tAddress('project') || 'Project'}
            value={value?.projectId || undefined}
            onValueChange={(val: string) => {
              onChange({ ...value, projectId: val })
            }}
            options={newModeProjectPager.visible}
            disabled={
              loadingNewModeProjects ||
              !(value?.newWardCode || value?.newProvinceCode)
            }
            loading={fetchingNewModeProjects}
            placeholder={
              loadingNewModeProjects
                ? tAddress('loading.projects') || 'Loading projects...'
                : tAddress('placeholders.selectProject') || 'Select project'
            }
            searchable={true}
            searchPlaceholder={
              tAddress('placeholders.searchProject') || 'Search project...'
            }
            emptyText={tAddress('empty.noResults')}
            noOptionsText={tAddress('empty.noOptions')}
            hasMore={newModeProjectPager.hasMore}
            onLoadMore={newModeProjectPager.loadMore}
            isLoadingMore={newModeProjectPager.isLoadingMore}
          />
        </div>
      )}
    </div>
  )
}
