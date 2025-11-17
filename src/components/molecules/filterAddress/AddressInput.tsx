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
  useNewProvinces,
  useNewWards,
} from '@/hooks/useAddress/useAddressQueries'
import type { NewProvince, NewWard } from '@/api/types/address.type'
import type { Option } from './usePagedList'

export interface AddressFilterData {
  province?: string
  district?: string
  ward?: string
  newProvinceCode?: string
  newWardCode?: string
  streetId?: string
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

  React.useEffect(() => {
    if (value?.addressEdited) return

    const findLabel = (opts: Option[], val?: string) =>
      opts.find((o) => o.value === (val || ''))?.label

    const parts: string[] = []

    if (isLegacy) {
      const wardLabel = findLabel(legacyWardOptions, value?.ward)
      if (wardLabel) parts.push(wardLabel)
      const districtLabel = findLabel(legacyDistrictOptions, value?.district)
      if (districtLabel) parts.push(districtLabel)
      const provinceLabel = findLabel(legacyProvinceOptions, value?.province)
      if (provinceLabel) parts.push(provinceLabel)
    } else {
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
    value?.ward,
    value?.district,
    value?.province,
    value?.newProvinceCode,
    value?.newWardCode,
    legacyWardOptions,
    legacyDistrictOptions,
    legacyProvinceOptions,
    newProvinceOptions,
    newWardOptions,
    onChange,
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
              onChange({ ...value, ward: val })
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
              onChange({ ...value, newWardCode: val })
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
        </div>
      )}
    </div>
  )
}
