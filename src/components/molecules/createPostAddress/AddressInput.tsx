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
  useNewProvinces,
  useNewWards,
} from '@/hooks/useAddress/useAddressQueries'
import type { NewProvince, NewWard } from '@/api/types/address.type'
import type { Option } from '../filterAddress/usePagedList'

export interface AddressInputProps {
  className?: string
  error?: string
}

export const AddressInput: React.FC<AddressInputProps> = ({
  className,
  error,
}) => {
  const tAddress = useTranslations('createPost.sections.propertyInfo.address')
  const tRoot = useTranslations('createPost.sections.propertyInfo')
  const { propertyInfo, updatePropertyInfo } = useCreatePost()

  // Shared placeholder text to avoid duplication
  const searchProvincePlaceholder =
    tAddress('placeholders.searchProvince') || 'Tìm kiếm tỉnh/thành...'

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

  // Auto-compose display address from selections when user hasn't edited manually
  React.useEffect(() => {
    if (propertyInfo?.propertyAddressEdited) return

    const findLabel = (opts: Option[], val?: string) =>
      opts.find((o) => o.value === (val || ''))?.label

    const parts: string[] = []

    if (isLegacy) {
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
      // New structure: Ward, Province
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
    propertyInfo?.ward,
    propertyInfo?.district,
    propertyInfo?.province,
    propertyInfo?.newProvinceCode,
    propertyInfo?.newWardCode,
    legacyWardOptions,
    legacyDistrictOptions,
    legacyProvinceOptions,
    newProvinceOptions,
    newWardOptions,
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
              searchPlaceholder={searchProvincePlaceholder}
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
                updatePropertyInfo({ ward: value })
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
              searchPlaceholder={searchProvincePlaceholder}
              emptyText={tAddress('empty.noResults')}
              noOptionsText={tAddress('empty.noOptions')}
            />
            <Combobox
              label={tAddress('ward')}
              value={propertyInfo?.newWardCode || undefined}
              onValueChange={(value: string) => {
                updatePropertyInfo({ newWardCode: value })
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
        </div>
      )}

      {/* Display Address (editable) */}
      <div className='space-y-2'>
        <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
          {tRoot('displayAddress') || 'Địa chỉ hiển thị trên tin đăng'}
        </label>
        <input
          type='text'
          className={`w-full h-10 px-3 border-2 rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring text-sm transition-all duration-200 ${
            error
              ? 'border-destructive dark:border-destructive focus:border-destructive focus:ring-destructive/50'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
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
        {error && (
          <p className='text-xs text-destructive' role='alert'>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
