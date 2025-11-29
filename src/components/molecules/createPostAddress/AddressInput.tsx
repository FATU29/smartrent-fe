import React, { useMemo, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import Combobox from '@/components/atoms/combobox'
import { Input } from '@/components/atoms/input'
import { Button } from '@/components/atoms/button'
import { toast } from 'sonner'
import { MapPin, Loader2 } from 'lucide-react'
import { useNewProvinces, useNewWardsInfinite } from '@/hooks/useAddress'
import { AddressService } from '@/api/services/address.service'
import { LegacyAddressSelector } from './LegacyAddressSelector'
import type { ListingAddress } from '@/api/types'

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

  // Init state hook
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [wardSearchKeyword, setWardSearchKeyword] = useState<string>('')

  // Init context hook
  const {
    propertyInfo,
    fulltextAddress,
    composedNewAddress,
    composedLegacyAddress,
    updatePropertyInfo,
    updateFulltextAddress,
  } = useCreatePost()

  // Extract province code to avoid unnecessary re-renders
  const provinceCode = useMemo(
    () => fulltextAddress?.newProvinceCode,
    [fulltextAddress?.newProvinceCode],
  )

  // Init address hooks
  const {
    data: newProvinces = [],
    isLoading: loadingProvinces,
    isFetching: fetchingProvinces,
    error: provincesError,
  } = useNewProvinces()

  const {
    data: newWardsPages,
    isLoading: loadingWards,
    error: wardsError,
    fetchNextPage: fetchMoreWards,
    hasNextPage: hasMoreWards,
    isFetchingNextPage: isFetchingMoreWards,
  } = useNewWardsInfinite(provinceCode, wardSearchKeyword || undefined, 20)

  const newWards = useMemo(() => {
    if (!newWardsPages?.pages) return []
    return newWardsPages.pages.flatMap((page) => page.data || [])
  }, [newWardsPages])

  const addressForGeocode = useMemo(() => {
    const street = propertyInfo?.address?.new?.street?.trim()
    const legacyText = fulltextAddress?.legacyAddressText || ''
    if (!legacyText) return null
    return street ? `${street}, ${legacyText}` : legacyText
  }, [propertyInfo?.address?.new?.street, fulltextAddress?.legacyAddressText])

  // Init event handlers
  const handleProvinceChange = (value: string) => {
    updateFulltextAddress({
      newProvinceCode: value,
      newWardCode: '',
      legacyAddressId: '',
      propertyAddressEdited: false,
    })
  }

  const handleWardChange = (value: string) => {
    updateFulltextAddress({
      newWardCode: value,
      legacyAddressId: '',
    })
  }

  const handleWardSearchChange = (value: string) => {
    setWardSearchKeyword(value)
  }

  const handleLoadMoreWards = () => {
    fetchMoreWards()
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
    updateFulltextAddress({
      legacyAddressId: value,
      legacyAddressText: label,
    })
  }

  const handleGeocodeAddress = async () => {
    if (!addressForGeocode?.trim()) {
      toast.error(
        tAddress('errors.legacyAddressRequired') ||
          'Vui lòng chọn địa chỉ cũ trước',
        { duration: 3000 },
      )
      return
    }

    setIsGeocoding(true)
    try {
      const response = await AddressService.geocode(addressForGeocode)

      if (response?.data) {
        const { latitude, longitude } = response.data
        const prev = propertyInfo.address
        updatePropertyInfo({
          address: {
            ...prev,
            latitude,
            longitude,
          },
        })

        toast.success(
          tAddress('geocode.success') ||
            'Đã lấy tọa độ từ Google Map thành công',
          { duration: 2000 },
        )
      } else {
        toast.error('Không tìm thấy địa chỉ trên Google Map', {
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('[AddressInput] Geocoding failed:', error)
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : ''

      if (
        errorMessage.includes('REQUEST_DENIED') ||
        errorMessage.includes('API key')
      ) {
        toast.error(
          'Vui lòng kích hoạt Geocoding API trong Google Cloud Console',
          { duration: 4000 },
        )
      } else if (
        errorMessage.includes('not found') ||
        errorMessage.includes('404')
      ) {
        toast.error('Không tìm thấy địa chỉ trên Google Map', {
          duration: 3000,
        })
      } else {
        toast.error('Không thể lấy tọa độ. Vui lòng thử lại sau.', {
          duration: 3000,
        })
      }
    } finally {
      setIsGeocoding(false)
    }
  }

  // Init effect hooks
  useEffect(() => {
    if (provincesError) {
      toast.error(tAddress('errors.loadProvincesFailed'))
    }
  }, [provincesError, tAddress])

  useEffect(() => {
    if (wardsError) {
      toast.error(tAddress('errors.loadWardsFailed'))
    }
  }, [wardsError, tAddress])

  const provinceOptions = useMemo(
    () => newProvinces.map((p) => ({ value: p.id, label: p.name })),
    [newProvinces],
  )
  const wardOptions = useMemo(
    () => newWards.map((w) => ({ value: w.code, label: w.name })),
    [newWards],
  )

  const legacyAddressText = fulltextAddress?.legacyAddressText || ''
  const showLegacySelector = provinceCode && fulltextAddress?.newWardCode
  const showLegacyAddress = !!legacyAddressText

  // Render
  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Province and Ward Selection */}
      <div className='space-y-3'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <Combobox
            label={tAddress('province')}
            value={provinceCode || undefined}
            onValueChange={handleProvinceChange}
            options={provinceOptions}
            disabled={loadingProvinces}
            loading={fetchingProvinces}
            placeholder={
              loadingProvinces
                ? tAddress('loading.provinces')
                : tAddress('placeholders.selectProvince')
            }
            searchable
            searchPlaceholder={
              tAddress('placeholders.searchProvince') ||
              'Tìm kiếm tỉnh/thành...'
            }
            emptyText={tAddress('empty.noResults')}
            noOptionsText={tAddress('empty.noOptions')}
            error={error}
          />
          <Combobox
            label={tAddress('ward')}
            value={fulltextAddress?.newWardCode || undefined}
            onValueChange={handleWardChange}
            options={wardOptions}
            disabled={loadingWards || !provinceCode}
            loading={loadingWards}
            placeholder={
              loadingWards
                ? tAddress('loading.wards')
                : tAddress('placeholders.selectWard')
            }
            searchable
            searchPlaceholder={
              tAddress('placeholders.searchWard') || 'Tìm kiếm phường/xã...'
            }
            onSearchChange={handleWardSearchChange}
            emptyText={tAddress('empty.noResults')}
            noOptionsText={tAddress('empty.noOptions')}
            hasMore={hasMoreWards}
            onLoadMore={handleLoadMoreWards}
            isLoadingMore={isFetchingMoreWards}
            loadingMoreText={tAddress('loading.loadingMore')}
            error={error}
          />
        </div>

        {/* Legacy Address Selector */}
        {showLegacySelector && (
          <LegacyAddressSelector
            provinceCode={provinceCode!}
            wardCode={fulltextAddress.newWardCode!}
            value={fulltextAddress?.legacyAddressId}
            onValueChange={() => {
              /* handled by onLegacySelect */
            }}
            onLegacySelect={handleLegacySelect}
          />
        )}
      </div>

      {/* Street and Display Address */}
      <div className='space-y-3'>
        {/* Street Input */}
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
                  provinceCode: prev?.new?.provinceCode as string,
                  wardCode: prev?.new?.wardCode as string,
                  street: e.target.value,
                },
                latitude: prev?.latitude ?? 0,
                longitude: prev?.longitude ?? 0,
              }
              updatePropertyInfo({ address: nextAddress })
            }}
          />
        </div>

        {/* Display Address (New Structure) */}
        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
            {tRoot('displayAddress') || 'Địa chỉ hiển thị trên tin đăng'}
          </label>
          <Input
            type='text'
            readOnly
            value={composedNewAddress}
            className='bg-gray-50 dark:bg-gray-800 cursor-text'
            placeholder={
              tRoot('displayAddressPlaceholder') ||
              'Địa chỉ sẽ tự động tạo từ đường/phố, phường/xã, tỉnh/thành'
            }
            aria-invalid={!!error}
          />
          {error && (
            <p className='text-xs text-destructive' role='alert'>
              {error}
            </p>
          )}
        </div>

        {/* Legacy Address Display and Geocode Button */}
        {showLegacyAddress && (
          <div className='space-y-2'>
            <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
              {tAddress('legacyAddress') ||
                'Địa chỉ hiển thị trên tin đăng (phiên bản cũ)'}
            </label>
            <div className='flex gap-2'>
              <Input
                type='text'
                readOnly
                value={composedLegacyAddress}
                className='flex-1 bg-gray-50 dark:bg-gray-800 cursor-text'
                placeholder={
                  tAddress('legacyAddressPlaceholder') ||
                  'Địa chỉ cũ sẽ hiển thị ở đây'
                }
              />
              <Button
                type='button'
                variant='outline'
                onClick={handleGeocodeAddress}
                disabled={isGeocoding || !addressForGeocode}
                className='flex items-center gap-2'
              >
                {isGeocoding ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    <span className='hidden sm:inline'>
                      {tAddress('geocode.loading')}
                    </span>
                  </>
                ) : (
                  <>
                    <MapPin className='w-4 h-4' />
                    <span className='hidden sm:inline'>
                      {tAddress('geocode.legacyButton') ||
                        'Lấy tọa độ từ Google Map'}
                    </span>
                  </>
                )}
              </Button>
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {tAddress('geocode.legacyDescription') ||
                'Nhấn nút để lấy tọa độ từ Google Map dựa trên địa chỉ cũ'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
