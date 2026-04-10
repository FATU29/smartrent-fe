import { useMemo, useEffect } from 'react'
import type { CreateListingRequest } from '@/api/types/property.type'

export interface FulltextAddress {
  newProvinceCode?: string
  newProvinceName?: string
  newWardCode?: string
  newWardName?: string
  legacyAddressId?: string
  legacyAddressText?: string
  propertyAddress?: string
  displayAddress?: string
  fullAddressNew?: string
  propertyAddressEdited?: boolean
}

interface Province {
  key: string
  name: string
}

interface Ward {
  code: string
  name: string
}

type ProvinceArray = readonly Province[] | Province[]
type WardArray = readonly Ward[] | Ward[]

export const useAddressComposition = (
  propertyInfo: Partial<CreateListingRequest>,
  fulltextAddress: FulltextAddress,
  setFulltextAddress: (
    updater: (prev: FulltextAddress) => FulltextAddress,
  ) => void,
  newProvinces: ProvinceArray,
  newWards: WardArray,
) => {
  const composedNewAddress = useMemo(() => {
    const parts: string[] = []
    const street = propertyInfo?.address?.newAddress?.street?.trim()
    if (street) parts.push(street)

    const wardCode =
      fulltextAddress?.newWardCode ||
      (propertyInfo?.address?.newAddress?.wardCode
        ? String(propertyInfo.address.newAddress.wardCode)
        : undefined)
    const ward = newWards.find((w) => w.code === wardCode)
    const wardName = ward?.name || fulltextAddress?.newWardName?.trim()
    if (wardName) parts.push(wardName)

    const provinceCode =
      fulltextAddress?.newProvinceCode ||
      (propertyInfo?.address?.newAddress?.provinceCode
        ? String(propertyInfo.address.newAddress.provinceCode)
        : undefined)
    const province = newProvinces.find(
      (p) =>
        p.key === provinceCode ||
        String((p as { id?: string }).id) === provinceCode,
    )
    const provinceName =
      province?.name || fulltextAddress?.newProvinceName?.trim()
    if (provinceName) parts.push(provinceName)

    const composed = parts.join(', ')
    if (composed) return composed

    return (
      fulltextAddress?.fullAddressNew?.trim() ||
      fulltextAddress?.displayAddress?.trim() ||
      ''
    )
  }, [
    propertyInfo?.address?.newAddress?.street,
    propertyInfo?.address?.newAddress?.wardCode,
    propertyInfo?.address?.newAddress?.provinceCode,
    fulltextAddress?.newWardCode,
    fulltextAddress?.newWardName,
    fulltextAddress?.newProvinceCode,
    fulltextAddress?.newProvinceName,
    fulltextAddress?.fullAddressNew,
    fulltextAddress?.displayAddress,
    newWards,
    newProvinces,
  ])

  const legacyAddressText = fulltextAddress?.legacyAddressText || ''
  const composedLegacyAddress = useMemo(() => {
    if (!legacyAddressText) return ''
    const street = propertyInfo?.address?.newAddress?.street?.trim()
    if (street) {
      return `${street}, ${legacyAddressText}`
    }
    return legacyAddressText
  }, [propertyInfo?.address?.newAddress?.street, legacyAddressText])

  // Auto-update display address when composed address changes
  useEffect(() => {
    if (fulltextAddress?.propertyAddressEdited) return

    if (
      composedNewAddress &&
      composedNewAddress !== fulltextAddress?.displayAddress
    ) {
      setFulltextAddress((prev) => ({
        ...prev,
        displayAddress: composedNewAddress,
        propertyAddress: composedNewAddress,
        fullAddressNew: composedNewAddress,
      }))
    }
  }, [
    composedNewAddress,
    fulltextAddress?.propertyAddressEdited,
    fulltextAddress?.displayAddress,
    setFulltextAddress,
  ])

  return {
    composedNewAddress,
    composedLegacyAddress,
  }
}
