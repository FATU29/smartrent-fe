import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ListingFilterRequest } from '@/api/types'
import {
  useLegacyProvinces,
  useLegacyDistricts,
  useLegacyWards,
  useNewProvinces,
  useNewWards,
} from '@/hooks/useAddress'
import CascadeSelectField from '@/components/atoms/cascadeSelectField'
import { Switch } from '@/components/atoms/switch'

interface AddressFilterViewProps {
  value: ListingFilterRequest
  onChange: (partial: Partial<ListingFilterRequest>) => void
}

const AddressFilterView: React.FC<AddressFilterViewProps> = ({
  value,
  onChange,
}) => {
  const t = useTranslations('residentialFilter.areaProject')

  // Default to new address (isLegacy=false) unless explicitly set true
  const [isLegacy, setIsLegacy] = useState(value.isLegacy === true)

  useEffect(() => {
    // Nếu chưa có isLegacy thì mặc định là false (new)
    if (typeof value.isLegacy === 'undefined') {
      setIsLegacy(false)
      onChange({ isLegacy: false })
    } else {
      setIsLegacy(value.isLegacy === true)
    }
  }, [value.isLegacy, onChange])

  // Legacy structure hooks (3 combobox: province, district, ward)
  const provinceId = value.provinceId ? Number(value.provinceId) : undefined
  const districtId = value.districtId ? Number(value.districtId) : undefined

  const { data: legacyProvincesData, isLoading: legacyProvincesLoading } =
    useLegacyProvinces()
  const { data: legacyDistrictsData, isLoading: legacyDistrictsLoading } =
    useLegacyDistricts(isLegacy ? provinceId : undefined)
  const { data: legacyWardsData, isLoading: legacyWardsLoading } =
    useLegacyWards(isLegacy ? districtId : undefined)

  // New structure hooks (2 combobox: province, ward)
  const provinceCode =
    !isLegacy && value.provinceId ? String(value.provinceId) : undefined
  const { data: newProvincesData, isLoading: newProvincesLoading } =
    useNewProvinces()
  const { data: newWardsData, isLoading: newWardsLoading } = useNewWards(
    !isLegacy ? provinceCode : undefined,
  )

  // Data extraction
  const legacyProvinces = legacyProvincesData || []
  const legacyDistricts = legacyDistrictsData || []
  const legacyWards = legacyWardsData || []
  const newProvinces = newProvincesData || []
  const newWards = newWardsData || []

  // Reset dependent fields when parent changes (legacy)
  useEffect(() => {
    if (isLegacy && !provinceId) {
      onChange({
        districtId: undefined,
        wardId: undefined,
      })
    }
  }, [provinceId, isLegacy])

  useEffect(() => {
    if (isLegacy && !districtId) {
      onChange({ wardId: undefined })
    }
  }, [districtId, isLegacy])

  // Reset dependent fields when parent changes (new)
  useEffect(() => {
    if (!isLegacy && !provinceCode) {
      onChange({
        wardId: undefined,
      })
    }
  }, [provinceCode, isLegacy])

  // Toggle structure and reset all address fields
  const handleToggleStructure = (checked: boolean) => {
    const newIsLegacy = !checked
    setIsLegacy(newIsLegacy)
    onChange({
      isLegacy: newIsLegacy,
      provinceId: undefined,
      districtId: undefined,
      wardId: undefined,
    })
  }

  const handleLegacyProvince = (id: string) => {
    onChange({
      provinceId: id ? Number(id) : undefined,
      districtId: undefined,
      wardId: undefined,
    })
  }

  const handleLegacyDistrict = (id: string) => {
    onChange({
      districtId: id ? Number(id) : undefined,
      wardId: undefined,
    })
  }

  const handleLegacyWard = (id: string) => {
    onChange({ wardId: id ? Number(id) : undefined })
  }

  const handleNewProvince = (code: string) => {
    onChange({
      provinceId: code || undefined,
      wardId: undefined,
    })
  }

  const handleNewWard = (code: string) => {
    onChange({ wardId: code || undefined })
  }

  return (
    <div className='p-4'>
      <div className='mb-4 space-y-3'>
        <h2 className='text-base font-semibold'>{t('title')}</h2>

        {/* Toggle between legacy and new address structure */}
        <div className='flex items-center justify-between py-2 px-3 bg-muted rounded-lg'>
          <div className='flex flex-col'>
            <span className='text-sm font-medium'>
              {isLegacy
                ? t('structureToggle.legacyTitle', {
                    count: legacyProvinces.length,
                  })
                : t('structureToggle.newTitle', {
                    count: newProvinces.length,
                  })}
            </span>
            <span className='text-xs text-muted-foreground'>
              {isLegacy
                ? t('structureToggle.legacyLevels')
                : t('structureToggle.newLevels')}
            </span>
          </div>
          <Switch checked={!isLegacy} onCheckedChange={handleToggleStructure} />
        </div>
      </div>

      {isLegacy ? (
        // Legacy structure (63 provinces): Province → District → Ward
        <div className='space-y-5'>
          {legacyProvincesLoading && (
            <div className='text-sm opacity-70'>Đang tải...</div>
          )}
          <CascadeSelectField
            label={t('province')}
            placeholder={t('chooseProvince')}
            value={value.provinceId ? String(value.provinceId) : undefined}
            options={legacyProvinces.map((p) => ({
              id: String(p.provinceId),
              label: p.name,
            }))}
            onChange={handleLegacyProvince}
            searchable
          />
          <CascadeSelectField
            label={t('district')}
            placeholder={t('chooseDistrict')}
            value={value.districtId ? String(value.districtId) : undefined}
            disabled={!provinceId || legacyDistrictsLoading}
            options={legacyDistricts.map((d) => ({
              id: String(d.districtId),
              label: d.name,
            }))}
            onChange={handleLegacyDistrict}
            searchable
          />
          <CascadeSelectField
            label={t('ward')}
            placeholder={t('chooseWard')}
            value={value.wardId ? String(value.wardId) : undefined}
            disabled={!districtId || legacyWardsLoading}
            options={legacyWards.map((w) => ({
              id: String(w.wardId),
              label: w.name,
            }))}
            onChange={handleLegacyWard}
            searchable
          />
        </div>
      ) : (
        // New structure (34 provinces): Province → Ward
        <div className='space-y-5'>
          {newProvincesLoading && (
            <div className='text-sm opacity-70'>Đang tải...</div>
          )}
          <CascadeSelectField
            label={t('province')}
            placeholder={t('chooseProvince')}
            value={provinceCode}
            options={newProvinces.map((p) => ({
              id: p.code,
              label: p.name,
            }))}
            onChange={handleNewProvince}
            searchable
          />
          <CascadeSelectField
            label={t('ward')}
            placeholder={t('chooseWard')}
            value={!isLegacy && value.wardId ? String(value.wardId) : undefined}
            disabled={!provinceCode || newWardsLoading}
            options={newWards.map((w) => ({
              id: w.code,
              label: w.name,
            }))}
            onChange={handleNewWard}
            searchable
          />
          <div className='text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg'>
            💡{' '}
            {t('structureToggle.newDescription', {
              count: newProvinces.length,
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressFilterView
