import React, { useMemo, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import Combobox from '@/components/atoms/combobox'
import { Input } from '@/components/atoms/input'
import { toast } from 'sonner'
import {
  useNewProvinces,
  useNewWards,
} from '@/hooks/useAddress/useAddressQueries'
import { LegacyAddressSelector } from './LegacyAddressSelector'
import { geocodeAddress } from '@/utils/geocoding'
import type { NewProvince, NewWard } from '@/api/types/address.type'
import type { ListingAddress } from '@/api/types'
import type { Option } from '../filterAddress/usePagedList'

export interface AddressInputProps {
  className?: string
  error?: string
}

const toOptions = (items: readonly (NewProvince | NewWard)[]): Option[] =>
  items
    .filter((i) => i?.code && i?.name)
    .map((i) => ({ value: i.code, label: i.name }))

export const AddressInput: React.FC<AddressInputProps> = ({
  className,
  error,
}) => {
  const tAddress = useTranslations('createPost.sections.propertyInfo.address')
  const tRoot = useTranslations('createPost.sections.propertyInfo')
  const {
    propertyInfo,
    fulltextAddress,
    updatePropertyInfo,
    updateFulltextAddress,
  } = useCreatePost()

  const searchProvincePlaceholder =
    tAddress('placeholders.searchProvince') || 'Tìm kiếm tỉnh/thành...'

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
  } = useNewWards(fulltextAddress?.newProvinceCode)

  React.useEffect(() => {
    if (errorNewProvinces) toast.error(tAddress('errors.loadProvincesFailed'))
    if (errorNewWards) toast.error(tAddress('errors.loadWardsFailed'))
  }, [errorNewProvinces, errorNewWards, tAddress])

  const newProvinceOptions = useMemo(
    () => toOptions(newProvinces),
    [newProvinces],
  )
  const newWardOptions = useMemo(() => toOptions(newWards), [newWards])

  // Track if we're currently geocoding to prevent race conditions
  const geocodingRef = useRef(false)
  const lastGeocodedAddress = useRef<string>('')

  // Auto-compose display address from selected location parts
  React.useEffect(() => {
    if (fulltextAddress?.propertyAddressEdited) return
    const findLabel = (opts: Option[], val?: string) =>
      opts.find((o) => o.value === (val || ''))?.label
    const parts: string[] = []
    const street = propertyInfo?.address?.new?.street?.trim()
    if (street) parts.push(street)
    const wardLabel = findLabel(newWardOptions, fulltextAddress?.newWardCode)
    if (wardLabel) parts.push(wardLabel)
    const provinceLabel = findLabel(
      newProvinceOptions,
      fulltextAddress?.newProvinceCode,
    )
    if (provinceLabel) parts.push(provinceLabel)
    const composed = parts.join(', ')
    if (composed && composed !== fulltextAddress?.propertyAddress) {
      updateFulltextAddress({
        propertyAddress: composed,
        displayAddress: composed,
        fullAddressNew: composed,
      })
    }
  }, [
    fulltextAddress?.propertyAddressEdited,
    fulltextAddress?.newProvinceCode,
    fulltextAddress?.newWardCode,
    propertyInfo?.address?.new?.street,
    newProvinceOptions,
    newWardOptions,
    updateFulltextAddress,
    fulltextAddress?.propertyAddress,
  ])

  // Auto-geocode address when it's complete and changed
  useEffect(() => {
    const address =
      fulltextAddress?.displayAddress || fulltextAddress?.propertyAddress

    // Skip if: no address, already geocoded this exact address, or currently geocoding
    if (
      !address?.trim() ||
      address === lastGeocodedAddress.current ||
      geocodingRef.current
    ) {
      return
    }

    // For manually edited addresses, check if address is substantial enough (at least 10 chars)
    // For auto-composed addresses, require province and ward selection
    const isManuallyEdited = fulltextAddress?.propertyAddressEdited
    const hasMinimumInfo =
      fulltextAddress?.newProvinceCode && fulltextAddress?.newWardCode
    const hasSubstantialAddress = address.length >= 10

    // Skip if: auto-composed without selections, or manual edit too short
    if (!isManuallyEdited && !hasMinimumInfo) {
      return
    }
    if (isManuallyEdited && !hasSubstantialAddress) {
      return
    }

    // Debounce: wait a bit in case user is still typing
    const timeoutId = setTimeout(async () => {
      geocodingRef.current = true
      lastGeocodedAddress.current = address

      try {
        const result = await geocodeAddress(address)

        if (result) {
          // Only update if coordinates actually changed
          const currentLat = propertyInfo?.address?.latitude ?? 0
          const currentLng = propertyInfo?.address?.longitude ?? 0
          const latChanged = Math.abs(currentLat - result.lat) > 0.0001
          const lngChanged = Math.abs(currentLng - result.lng) > 0.0001

          if (latChanged || lngChanged) {
            const prev = propertyInfo.address
            const nextAddress: ListingAddress = {
              legacy: prev?.legacy,
              new: prev?.new,
              latitude: result.lat,
              longitude: result.lng,
            }
            updatePropertyInfo({ address: nextAddress })

            toast.success(
              tAddress('geocode.success') ||
                'Đã tự động định vị địa chỉ trên bản đồ',
              { duration: 2000 },
            )
          }
        } else {
          // Geocoding failed - check console for details
          console.warn(
            '[AddressInput] Geocoding returned no results for:',
            address,
          )
        }
      } catch (error) {
        console.error('[AddressInput] Geocoding failed:', error)
        // Only show error if it's an API configuration issue
        if (
          error instanceof Error &&
          error.message.includes('REQUEST_DENIED')
        ) {
          toast.error(
            'Vui lòng kích hoạt Geocoding API trong Google Cloud Console',
            { duration: 4000 },
          )
        }
        // Otherwise silent fail - don't annoy user for network issues
      } finally {
        geocodingRef.current = false
      }
    }, 1500) // 1.5 second debounce for manual typing

    return () => clearTimeout(timeoutId)
  }, [
    fulltextAddress?.displayAddress,
    fulltextAddress?.propertyAddress,
    fulltextAddress?.propertyAddressEdited,
    fulltextAddress?.newProvinceCode,
    fulltextAddress?.newWardCode,
    propertyInfo.address,
    updatePropertyInfo,
    tAddress,
  ])

  const handleProvinceChange = (value: string) => {
    updateFulltextAddress({
      newProvinceCode: value,
      newWardCode: '',
      legacyAddressId: '',
      propertyAddressEdited: false,
    })
    // Reset last geocoded address when province changes
    lastGeocodedAddress.current = ''
  }

  const handleWardChange = (value: string) => {
    updateFulltextAddress({ newWardCode: value, legacyAddressId: '' })
    // Reset last geocoded address when ward changes
    lastGeocodedAddress.current = ''
  }

  const handleLegacySelect = (value: string, label: string) => {
    const [provinceId, districtId, wardId] = value.split('-')
    const prev = propertyInfo.address
    const nextAddress: ListingAddress = {
      legacy: {
        provinceId: Number(provinceId),
        districtId: Number(districtId),
        wardId: Number(wardId),
      },
      new: prev?.new,
      latitude: prev?.latitude ?? 0,
      longitude: prev?.longitude ?? 0,
    }
    updatePropertyInfo({ address: nextAddress })
    updateFulltextAddress({ legacyAddressId: value })
    if (fulltextAddress?.propertyAddressEdited) return
    const street = propertyInfo?.address?.new?.street?.trim()
    const [province, district, ward] = label.split(' - ')
    const parts: string[] = []
    if (street) parts.push(street)
    if (ward) parts.push(ward)
    if (district) parts.push(district)
    if (province) parts.push(province)
    const composed = parts.join(', ')
    if (composed)
      updateFulltextAddress({
        propertyAddress: composed,
        displayAddress: composed,
        fullAddressNew: composed,
      })
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className='space-y-3'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <Combobox
            label={tAddress('province')}
            value={fulltextAddress?.newProvinceCode || undefined}
            onValueChange={handleProvinceChange}
            options={newProvinceOptions}
            disabled={loadingNewProvinces}
            loading={fetchingNewProvinces}
            placeholder={
              loadingNewProvinces
                ? tAddress('loading.provinces')
                : tAddress('placeholders.selectProvince')
            }
            searchable
            searchPlaceholder={searchProvincePlaceholder}
            emptyText={tAddress('empty.noResults')}
            noOptionsText={tAddress('empty.noOptions')}
            error={error}
          />
          <Combobox
            label={tAddress('ward')}
            value={fulltextAddress?.newWardCode || undefined}
            onValueChange={handleWardChange}
            options={newWardOptions}
            disabled={loadingNewWards || !fulltextAddress?.newProvinceCode}
            loading={fetchingNewWards}
            placeholder={
              loadingNewWards
                ? tAddress('loading.wards')
                : tAddress('placeholders.selectWard')
            }
            searchable
            searchPlaceholder={
              tAddress('placeholders.searchWard') || 'Tìm kiếm phường/xã...'
            }
            emptyText={tAddress('empty.noResults')}
            noOptionsText={tAddress('empty.noOptions')}
            error={error}
          />
        </div>
        {fulltextAddress?.newProvinceCode && fulltextAddress?.newWardCode && (
          <LegacyAddressSelector
            provinceCode={fulltextAddress.newProvinceCode!}
            wardCode={fulltextAddress.newWardCode!}
            value={fulltextAddress?.legacyAddressId}
            onValueChange={() => {
              /* handled by onLegacySelect */
            }}
            onLegacySelect={handleLegacySelect}
          />
        )}
      </div>
      <div className='space-y-3'>
        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
            {tRoot('street') || 'Đường/phố (tuỳ chọn)'}
          </label>
          <Input
            type='text'
            placeholder={
              tRoot('streetPlaceholder') || 'Ví dụ: Số 1 Trần Hưng Đạo'
            }
            value={propertyInfo?.address?.new?.street || ''}
            onChange={(e) => {
              const prev = propertyInfo.address
              const nextAddress: ListingAddress = {
                legacy: prev?.legacy,
                new: {
                  provinceId: prev?.new?.provinceId ?? 0,
                  wardId: prev?.new?.wardId ?? 0,
                  street: e.target.value,
                },
                latitude: prev?.latitude ?? 0,
                longitude: prev?.longitude ?? 0,
              }
              updatePropertyInfo({ address: nextAddress })
            }}
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
            {tRoot('displayAddress') || 'Địa chỉ hiển thị trên tin đăng'}
          </label>
          <Input
            type='text'
            placeholder={
              tRoot('displayAddressPlaceholder') ||
              'Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM'
            }
            value={
              fulltextAddress?.displayAddress ||
              fulltextAddress?.propertyAddress ||
              ''
            }
            onChange={(e) => {
              const v = e.target.value
              updateFulltextAddress({
                propertyAddress: v,
                displayAddress: v,
                fullAddressNew: v,
                propertyAddressEdited: true,
              })
            }}
            aria-invalid={!!error}
          />
          {error && (
            <p className='text-xs text-destructive' role='alert'>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
