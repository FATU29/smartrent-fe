import React, { useCallback, useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
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

export interface AddressInputProps {
  className?: string
}

type Option = {
  value: string
  label: string
}

export const AddressInput: React.FC<AddressInputProps> = ({ className }) => {
  const tAddress = useTranslations('createPost.sections.propertyInfo.address')
  const tRoot = useTranslations('createPost.sections.propertyInfo')
  const { propertyInfo, updatePropertyInfo } = useCreatePost()

  const isLegacy = useMemo(() => {
    return propertyInfo?.addressStructureType !== 'new'
  }, [propertyInfo?.addressStructureType])

  const {
    data: legacyProvinces = [],
    isLoading: loadingLegacyProvinces,
    isFetching: fetchingLegacyProvinces,
    error: errorLegacyProvinces,
  } = useLegacyProvinces()

  const selectedLegacyProvinceId = useMemo(() => {
    const id = parseInt(propertyInfo?.province || '0')
    return id > 0 ? id : undefined
  }, [propertyInfo?.province])

  const {
    data: legacyDistricts = [],
    isLoading: loadingLegacyDistricts,
    isFetching: fetchingLegacyDistricts,
    error: errorLegacyDistricts,
  } = useLegacyDistricts(selectedLegacyProvinceId)

  const selectedLegacyDistrictId = useMemo(() => {
    const id = parseInt(propertyInfo?.district || '0')
    return id > 0 ? id : undefined
  }, [propertyInfo?.district])

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

  // Projects depend on district (preferred) or province when using legacy structure
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
  } = useNewWards(propertyInfo?.newProvinceCode)

  const [derivedLegacyIds, setDerivedLegacyIds] = React.useState<{
    provinceId?: number
    districtId?: number
    wardId?: number
  }>({})

  React.useEffect(() => {
    let cancelled = false
    const convert = async () => {
      if (!propertyInfo?.newProvinceCode || !propertyInfo?.newWardCode) {
        if (!cancelled) setDerivedLegacyIds({})
        return
      }
      try {
        const res = await AddressService.convertNewToLegacy(
          propertyInfo.newProvinceCode,
          propertyInfo.newWardCode,
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
  }, [propertyInfo?.newProvinceCode, propertyInfo?.newWardCode])

  // Fetch streets for new structure: by district (from conversion)
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

  // Track conversion status to prevent duplicate API calls
  const legacyToNewConversionRef = React.useRef<string>('')
  const newToLegacyConversionRef = React.useRef<string>('')

  // Auto-convert legacy to new when legacy address is complete
  React.useEffect(() => {
    const provinceId = parseInt(propertyInfo.province || '0')
    const districtId = parseInt(propertyInfo.district || '0')
    const wardId = parseInt(propertyInfo.ward || '0')

    const conversionKey = `${provinceId}-${districtId}-${wardId}`

    if (
      isLegacy &&
      provinceId > 0 &&
      districtId > 0 &&
      wardId > 0 &&
      legacyToNewConversionRef.current !== conversionKey
    ) {
      legacyToNewConversionRef.current = conversionKey
      // Auto-convert to new structure
      AddressService.convertLegacyToNew(provinceId, districtId, wardId)
        .then((response) => {
          if (response?.data?.data?.newAddress) {
            const { newAddress } = response.data.data
            updatePropertyInfo({
              newProvinceCode: newAddress.province.code,
              newWardCode: newAddress.ward?.code || '',
            })
            toast.success(tAddress('convert.autoConvertSuccess'))
          }
        })
        .catch(() => {
          // Silent fail - conversion is optional
          legacyToNewConversionRef.current = ''
        })
    }
  }, [
    isLegacy,
    propertyInfo.province,
    propertyInfo.district,
    propertyInfo.ward,
  ])

  // Auto-convert new to legacy when new address is complete
  React.useEffect(() => {
    const provinceCode = propertyInfo.newProvinceCode || ''
    const wardCode = propertyInfo.newWardCode || ''

    const conversionKey = `${provinceCode}-${wardCode}`

    if (
      !isLegacy &&
      provinceCode &&
      wardCode &&
      newToLegacyConversionRef.current !== conversionKey
    ) {
      newToLegacyConversionRef.current = conversionKey
      // Auto-convert to legacy structure
      AddressService.convertNewToLegacy(provinceCode, wardCode)
        .then((response) => {
          if (response?.data?.data?.legacyAddress) {
            const { legacyAddress } = response.data.data
            updatePropertyInfo({
              province: legacyAddress.province.id.toString(),
              district: legacyAddress.district?.id.toString() || '',
              ward: legacyAddress.ward?.id.toString() || '',
            })
            toast.success(tAddress('convert.autoConvertSuccess'))
          }
        })
        .catch(() => {
          // Silent fail - conversion is optional
          newToLegacyConversionRef.current = ''
        })
    }
  }, [isLegacy, propertyInfo.newProvinceCode, propertyInfo.newWardCode])

  const handleStructureTypeChange = useCallback(
    (checked: boolean) => {
      const newType = checked ? 'new' : 'legacy'
      // Keep converted data when switching
      updatePropertyInfo({
        addressStructureType: newType,
      })
    },
    [updatePropertyInfo],
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

  // Build options for new-structure streets/projects from derived legacy fetches
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

  // Street search states with debounce
  const [legacyStreetSearch, setLegacyStreetSearch] = React.useState('')
  const debouncedLegacyStreetSearch = useDebounce(legacyStreetSearch, 250)
  const [newStreetSearch, setNewStreetSearch] = React.useState('')
  const debouncedNewStreetSearch = useDebounce(newStreetSearch, 250)

  // Search streets via API when query is present
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

  // Helpers to safely extract fields from different API shapes
  const streetIdOf = (
    s: Partial<StreetExtended> & { id?: number },
  ): number | undefined => s.streetId ?? s.id

  // Options mapping for search results
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

  // Client-side infinite pagination for long lists (streets, projects)
  const usePagedList = (
    options: Option[],
    pageSize: number = 50,
  ): {
    visible: Option[]
    hasMore: boolean
    loadMore: () => void
    isLoadingMore: boolean
  } => {
    const [page, setPage] = React.useState(1)
    const [isLoadingMore, setIsLoadingMore] = React.useState(false)

    // Reset pagination when underlying options change
    React.useEffect(() => {
      setPage(1)
    }, [options])

    const visible = React.useMemo(() => {
      return options.slice(0, page * pageSize)
    }, [options, page, pageSize])

    const hasMore = visible.length < options.length

    const loadMore = React.useCallback(() => {
      if (!hasMore || isLoadingMore) return
      setIsLoadingMore(true)
      // Simulate async for UI feedback; data is already in-memory
      setTimeout(() => {
        setPage((p) => p + 1)
        setIsLoadingMore(false)
      }, 0)
    }, [hasMore, isLoadingMore])

    return { visible, hasMore, loadMore, isLoadingMore }
  }

  // Legacy pagers
  const legacyStreetPager = usePagedList(legacyStreetOptions)
  const legacyStreetSearchPager = usePagedList(legacySearchStreetOptions)
  const legacyProjectPager = usePagedList(legacyProjectOptions)

  // New-mode pagers (derived legacy data)
  const newModeStreetPager = usePagedList(newModeStreetOptions)
  const newModeStreetSearchPager = usePagedList(newModeSearchStreetOptions)
  const newModeProjectPager = usePagedList(newModeProjectOptions)

  // Auto-compose display address from selections when user hasn't edited manually
  React.useEffect(() => {
    if (propertyInfo?.propertyAddressEdited) return

    const findLabel = (opts: Option[], val?: string) =>
      opts.find((o) => o.value === (val || ''))?.label

    const parts: string[] = []

    if (isLegacy) {
      // Prefer project name first if selected
      const projectLabel = findLabel(
        legacyProjectOptions,
        propertyInfo?.projectId,
      )
      if (projectLabel) parts.push(projectLabel)

      // Street next
      const streetLabel = findLabel(legacyStreetOptions, propertyInfo?.streetId)
      if (streetLabel) parts.push(streetLabel)

      // Ward, District, Province
      const wardLabel = findLabel(legacyWardOptions, propertyInfo?.ward)
      if (wardLabel) parts.push(wardLabel)
      const districtLabel = findLabel(
        legacyDistrictOptions,
        propertyInfo?.district,
      )
      if (districtLabel) parts.push(districtLabel)
      const provinceLabel = findLabel(
        legacyProvinceOptions,
        propertyInfo?.province,
      )
      if (provinceLabel) parts.push(provinceLabel)
    } else {
      // New structure: Project, Street, Ward, Province
      const projectLabel = findLabel(
        newModeProjectOptions,
        propertyInfo?.projectId,
      )
      if (projectLabel) parts.push(projectLabel)

      const streetLabel = findLabel(
        newModeStreetOptions,
        propertyInfo?.streetId,
      )
      if (streetLabel) parts.push(streetLabel)

      const wardLabel = findLabel(newWardOptions, propertyInfo?.newWardCode)
      if (wardLabel) parts.push(wardLabel)
      const provinceLabel = findLabel(
        newProvinceOptions,
        propertyInfo?.newProvinceCode,
      )
      if (provinceLabel) parts.push(provinceLabel)
    }

    const composed = parts.join(', ')
    if (composed && composed !== propertyInfo?.propertyAddress) {
      updatePropertyInfo({ propertyAddress: composed })
    }
  }, [
    propertyInfo?.propertyAddressEdited,
    isLegacy,
    propertyInfo?.projectId,
    propertyInfo?.streetId,
    propertyInfo?.ward,
    propertyInfo?.district,
    propertyInfo?.province,
    propertyInfo?.newProvinceCode,
    propertyInfo?.newWardCode,
    legacyProjectOptions,
    legacyStreetOptions,
    legacyWardOptions,
    legacyDistrictOptions,
    legacyProvinceOptions,
    newProvinceOptions,
    newWardOptions,
    newModeProjectOptions,
    newModeStreetOptions,
    updatePropertyInfo,
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
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <Combobox
              label={tAddress('province')}
              value={propertyInfo?.province || undefined}
              onValueChange={(value: string) => {
                updatePropertyInfo({
                  province: value,
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
              value={propertyInfo?.district || undefined}
              onValueChange={(value: string) => {
                updatePropertyInfo({
                  district: value,
                  ward: '',
                  streetId: '',
                  projectId: '',
                })
              }}
              options={legacyDistrictOptions}
              disabled={loadingLegacyDistricts || !propertyInfo?.province}
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
              value={propertyInfo?.ward || undefined}
              onValueChange={(value: string) => {
                updatePropertyInfo({ ward: value, streetId: '' })
              }}
              options={legacyWardOptions}
              disabled={loadingLegacyWards || !propertyInfo?.district}
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
          </div>

          {/* Streets and Projects (Legacy) */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <Combobox
              label={tAddress('street') || 'Đường phố'}
              value={propertyInfo?.streetId || undefined}
              onValueChange={(value: string) => {
                updatePropertyInfo({ streetId: value })
              }}
              options={
                debouncedLegacyStreetSearch
                  ? legacyStreetSearchPager.visible
                  : legacyStreetPager.visible
              }
              disabled={
                // Allow search results to show even if base filters not set
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
              value={propertyInfo?.projectId || undefined}
              onValueChange={(value: string) => {
                updatePropertyInfo({ projectId: value })
              }}
              options={legacyProjectPager.visible}
              disabled={
                loadingLegacyProjects ||
                !(propertyInfo?.district || propertyInfo?.province)
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
        </div>
      )}

      {/* New Structure (34 provinces) */}
      {!isLegacy && (
        <div className='space-y-3'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <Combobox
              label={tAddress('province')}
              value={propertyInfo?.newProvinceCode || undefined}
              onValueChange={(value: string) => {
                updatePropertyInfo({
                  newProvinceCode: value,
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
              value={propertyInfo?.newWardCode || undefined}
              onValueChange={(value: string) => {
                updatePropertyInfo({ newWardCode: value, streetId: '' })
              }}
              options={newWardOptions}
              disabled={loadingNewWards || !propertyInfo?.newProvinceCode}
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
          </div>

          {/* Streets and Projects (new structure via conversion) */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <Combobox
              label={tAddress('street') || 'Street'}
              value={propertyInfo?.streetId || undefined}
              onValueChange={(value: string) => {
                updatePropertyInfo({ streetId: value })
              }}
              options={
                debouncedNewStreetSearch
                  ? newModeStreetSearchPager.visible
                  : newModeStreetPager.visible
              }
              disabled={
                // Allow search results to show even if derived district isn't ready yet
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
              value={propertyInfo?.projectId || undefined}
              onValueChange={(value: string) => {
                updatePropertyInfo({ projectId: value })
              }}
              options={newModeProjectPager.visible}
              disabled={
                loadingNewModeProjects ||
                !(propertyInfo?.newWardCode || propertyInfo?.newProvinceCode)
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
        </div>
      )}

      {/* Display Address (editable) */}
      <div className='space-y-2'>
        <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
          {tRoot('displayAddress') || 'Địa chỉ hiển thị trên tin đăng'}
        </label>
        <input
          type='text'
          className='w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring text-sm'
          placeholder={
            tRoot('displayAddressPlaceholder') ||
            'Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM'
          }
          value={propertyInfo?.propertyAddress || ''}
          onChange={(e) =>
            updatePropertyInfo({
              propertyAddress: e.target.value,
              propertyAddressEdited: true,
            })
          }
        />
      </div>
    </div>
  )
}
