/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import Combobox from '@/components/atoms/combobox'
import { Input } from '@/components/atoms/input'
import { toast } from 'sonner'
import {
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

  // Extended fields for UI state management (legacy address fields not in CreateListingRequest)
  const typedPropertyInfo = propertyInfo as any

  // Shared placeholder text to avoid duplication
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
  } = useNewWards(typedPropertyInfo?.newProvinceCode)

  React.useEffect(() => {
    if (errorNewProvinces) {
      toast.error(tAddress('errors.loadProvincesFailed'))
    }
    if (errorNewWards) {
      toast.error(tAddress('errors.loadWardsFailed'))
    }
  }, [errorNewProvinces, errorNewWards, tAddress])

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
    if (typedPropertyInfo?.propertyAddressEdited) return

    const findLabel = (opts: Option[], val?: string) =>
      opts.find((o) => o.value === (val || ''))?.label

    const parts: string[] = []
    // street
    const street = typedPropertyInfo?.address?.new?.street
    if (street && street.trim()) {
      parts.push(street.trim())
    }

    // New structure: Ward, Province
    const wardLabel = findLabel(newWardOptions, typedPropertyInfo?.newWardCode)
    if (wardLabel) parts.push(wardLabel)
    const provinceLabel = findLabel(
      newProvinceOptions,
      typedPropertyInfo?.newProvinceCode,
    )
    if (provinceLabel) parts.push(provinceLabel)

    const composed = parts.join(', ')
    if (composed && composed !== typedPropertyInfo?.propertyAddress) {
      // Store composed address in multiple helpful fields for downstream steps (AI valuation, order summary)
      updatePropertyInfo({
        propertyAddress: composed,
        displayAddress: composed,
        fullAddressNew: composed,
      } as any)
    }
  }, [
    typedPropertyInfo?.propertyAddressEdited,
    typedPropertyInfo?.newProvinceCode,
    typedPropertyInfo?.newWardCode,
    typedPropertyInfo?.address?.new?.street,
    newProvinceOptions,
    newWardOptions,
    updatePropertyInfo,
  ])

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Address Selection (34 provinces structure) */}
      <div className='space-y-3'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <Combobox
            label={tAddress('province')}
            value={typedPropertyInfo?.newProvinceCode || undefined}
            onValueChange={(value: string) => {
              updatePropertyInfo({
                newProvinceCode: value,
                newWardCode: '',
              } as any)
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
            error={error}
          />
          <Combobox
            label={tAddress('ward')}
            value={typedPropertyInfo?.newWardCode || undefined}
            onValueChange={(value: string) => {
              updatePropertyInfo({ newWardCode: value } as any)
            }}
            options={newWardOptions}
            disabled={loadingNewWards || !typedPropertyInfo?.newProvinceCode}
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
            error={error}
          />
        </div>
      </div>

      {/* Display Address (editable) */}
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
            value={typedPropertyInfo?.address?.new?.street || ''}
            onChange={(e) => {
              const streetValue = e.target.value
              updatePropertyInfo({
                address: {
                  ...typedPropertyInfo?.address,
                  new: {
                    ...typedPropertyInfo?.address?.new,
                    street: streetValue,
                  },
                },
              } as any)
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
              typedPropertyInfo?.displayAddress ||
              typedPropertyInfo?.propertyAddress ||
              ''
            }
            onChange={(e) =>
              updatePropertyInfo({
                propertyAddress: e.target.value,
                displayAddress: e.target.value,
                fullAddressNew: e.target.value,
                propertyAddressEdited: true,
              } as any)
            }
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
