import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useMergeHistory } from '@/hooks/useAddress'
import Combobox from '@/components/atoms/combobox'
import { toast } from 'sonner'
import type { MergeHistoryLegacySource } from '@/api/types/address.type'
import { Option } from '@/components/organisms/createPostSections/index.helper'

export interface LegacyAddressSelectorProps {
  provinceCode?: string
  wardCode?: string
  value?: string // Legacy address ID (e.g., "1-2-3" for provinceId-districtId-wardId)
  onValueChange?: (value: string) => void
  onLegacySelect?: (value: string, label: string) => void
  className?: string
}

export const LegacyAddressSelector: React.FC<LegacyAddressSelectorProps> = ({
  provinceCode,
  wardCode,
  value,
  onValueChange,
  onLegacySelect,
  className,
}) => {
  const tAddress = useTranslations('createPost.sections.propertyInfo.address')

  const {
    data: mergeHistory,
    isLoading,
    isFetching,
    error,
  } = useMergeHistory(provinceCode, wardCode)

  React.useEffect(() => {
    if (error) {
      toast.error(tAddress('errors.loadMergeHistoryFailed'))
    }
  }, [error, tAddress])

  const legacyOptions: Option[] = useMemo(() => {
    if (!mergeHistory?.legacy_sources) return []

    return mergeHistory.legacy_sources.map(
      (source: MergeHistoryLegacySource) => {
        const { legacy_address } = source
        const provinceName = legacy_address.province?.name || ''
        const districtName = legacy_address.district?.name || ''
        const wardName = legacy_address.ward?.name || ''

        // Format: "Province - District - Ward"
        const label = tAddress('legacySelection.format', {
          province: provinceName,
          district: districtName,
          ward: wardName,
        })

        // Value: "provinceId-districtId-wardId"
        const valueStr = `${legacy_address.province?.id || ''}-${legacy_address.district?.id || ''}-${legacy_address.ward?.id || ''}`

        return {
          value: valueStr,
          label,
        }
      },
    )
  }, [mergeHistory, tAddress])

  // Don't render if no merge history data or no legacy sources
  if (!mergeHistory || !mergeHistory.legacy_sources?.length) {
    return null
  }

  return (
    <div className={className}>
      <div className='space-y-2'>
        <Combobox
          label={tAddress('legacySelection.label')}
          value={value}
          onValueChange={(newValue: string) => {
            onValueChange?.(newValue)
            const selected = legacyOptions.find((o) => o.value === newValue)
            if (selected) {
              onLegacySelect?.(newValue, selected.label)
            }
          }}
          options={legacyOptions}
          disabled={isLoading}
          loading={isFetching}
          placeholder={
            isLoading
              ? tAddress('legacySelection.loading')
              : tAddress('legacySelection.placeholder')
          }
          searchable={true}
          searchPlaceholder={tAddress('legacySelection.searchPlaceholder')}
          emptyText={tAddress('legacySelection.noResults')}
          noOptionsText={tAddress('legacySelection.noResults')}
        />
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          {tAddress('legacySelection.description')}
        </p>
      </div>
    </div>
  )
}
