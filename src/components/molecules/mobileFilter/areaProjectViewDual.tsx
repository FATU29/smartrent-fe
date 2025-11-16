import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ListFilters } from '@/contexts/list/index.type'
import {
  useLegacyProvinces,
  useLegacyDistricts,
  useLegacyWards,
  useLegacyStreets,
  useLegacyProjects,
  useNewProvinces,
  useNewWards,
} from '@/hooks/useAddress'
import CascadeSelectField from '@/components/atoms/cascadeSelectField'
import { Button } from '@/components/atoms/button'

interface AreaProjectViewDualProps {
  value: ListFilters
  onChange: (partial: Partial<ListFilters>) => void
  defaultStructure?: 'legacy' | 'new'
}

const AreaProjectViewDual: React.FC<AreaProjectViewDualProps> = ({
  value,
  onChange,
  defaultStructure = 'legacy',
}) => {
  const t = useTranslations('residentialFilter.areaProject')
  const [structure, setStructure] = useState<'legacy' | 'new'>(defaultStructure)

  // Legacy structure hooks
  const provinceId = value.provinceId ? Number(value.provinceId) : undefined
  const districtId = value.districtId ? Number(value.districtId) : undefined
  const wardId = value.wardId ? Number(value.wardId) : undefined

  const { data: legacyProvincesData, isLoading: legacyProvincesLoading } =
    useLegacyProvinces()
  const { data: legacyDistrictsData, isLoading: legacyDistrictsLoading } =
    useLegacyDistricts(provinceId)
  const { data: legacyWardsData, isLoading: legacyWardsLoading } =
    useLegacyWards(districtId)
  const { data: legacyStreetsData, isLoading: legacyStreetsLoading } =
    useLegacyStreets(wardId, districtId, provinceId)
  const { data: legacyProjectsData, isLoading: legacyProjectsLoading } =
    useLegacyProjects(provinceId, districtId)

  // New structure hooks
  const provinceCode = value.provinceId as string | undefined
  const { data: newProvincesData, isLoading: newProvincesLoading } =
    useNewProvinces()
  const { data: newWardsData, isLoading: newWardsLoading } =
    useNewWards(provinceCode)

  // Data extraction
  const legacyProvinces = legacyProvincesData || []
  const legacyDistricts = legacyDistrictsData || []
  const legacyWards = legacyWardsData || []
  const legacyStreets = legacyStreetsData || []
  const legacyProjects = legacyProjectsData || []
  const newProvinces = newProvincesData || []
  const newWards = newWardsData || []

  // Reset dependent fields when parent changes (legacy)
  useEffect(() => {
    if (structure === 'legacy' && !provinceId) {
      onChange({
        districtId: undefined,
        wardId: undefined,
        streetId: undefined,
        projectId: undefined,
      })
    }
  }, [provinceId, structure])
  useEffect(() => {
    if (structure === 'legacy' && !districtId) {
      onChange({ wardId: undefined, streetId: undefined, projectId: undefined })
    }
  }, [districtId, structure])
  useEffect(() => {
    if (structure === 'legacy' && !wardId) {
      onChange({ streetId: undefined })
    }
  }, [wardId, structure])
  // Reset dependent fields when parent changes (new)
  useEffect(() => {
    if (structure === 'new' && !provinceCode) {
      onChange({
        wardId: undefined,
        districtId: undefined,
        streetId: undefined,
        projectId: undefined,
      })
    }
  }, [provinceCode, structure])

  // Toggle structure and reset all fields
  const handleToggleStructure = () => {
    const newStructure = structure === 'legacy' ? 'new' : 'legacy'
    setStructure(newStructure)
    onChange({
      provinceId: undefined,
      districtId: undefined,
      wardId: undefined,
      streetId: undefined,
      projectId: undefined,
    })
  }

  const handleProvince = (id: string) =>
    onChange({ provinceId: id ? Number(id) : undefined })
  const handleDistrict = (id: string) =>
    onChange({ districtId: id ? Number(id) : undefined })
  const handleWard = (id: string) =>
    onChange({ wardId: id ? Number(id) : undefined })
  const handleStreet = (id: string) =>
    onChange({ streetId: id ? Number(id) : undefined })
  const handleProject = (id: string) => onChange({ projectId: id || undefined })

  if (structure === 'legacy') {
    return (
      <div className='p-4'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-base font-semibold'>{t('title')}</h2>
          <Button
            variant='outline'
            size='sm'
            onClick={handleToggleStructure}
            type='button'
          >
            Switch to New (34)
          </Button>
        </div>
        {legacyProvincesLoading && (
          <div className='text-sm opacity-70'>Loading...</div>
        )}
        <div className='space-y-5'>
          <CascadeSelectField
            label={t('province')}
            placeholder={t('chooseProvince')}
            value={value.provinceId as string | undefined}
            options={legacyProvinces.map((p) => ({
              id: String(p.provinceId),
              label: p.name,
            }))}
            onChange={handleProvince}
            searchable
          />
          <CascadeSelectField
            label={t('district')}
            placeholder={t('chooseDistrict')}
            value={value.districtId as string | undefined}
            disabled={!provinceId || legacyDistrictsLoading}
            options={legacyDistricts.map((d) => ({
              id: String(d.districtId),
              label: d.name,
            }))}
            onChange={handleDistrict}
            searchable
          />
          <CascadeSelectField
            label={t('ward')}
            placeholder={t('chooseWard')}
            value={value.wardId as string | undefined}
            disabled={!districtId || legacyWardsLoading}
            options={legacyWards.map((w) => ({
              id: String(w.wardId),
              label: w.name,
            }))}
            onChange={handleWard}
            searchable
          />
          <CascadeSelectField
            label={t('street')}
            placeholder={t('chooseStreet')}
            value={value.streetId ? String(value.streetId) : undefined}
            disabled={!districtId || legacyStreetsLoading}
            options={legacyStreets.map((s) => ({
              id: String(s.streetId),
              label: s.name,
            }))}
            onChange={handleStreet}
            searchable
          />
          <CascadeSelectField
            label={t('project')}
            placeholder={t('chooseProject')}
            value={value.projectId as string | undefined}
            disabled={!districtId || legacyProjectsLoading}
            options={legacyProjects.map((pr) => ({
              id: String(pr.id),
              label: pr.name,
            }))}
            onChange={handleProject}
            searchable
          />
        </div>
      </div>
    )
  }

  // New structure (34 provinces)
  return (
    <div className='p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-base font-semibold'>{t('title')}</h2>
        <Button
          variant='outline'
          size='sm'
          onClick={handleToggleStructure}
          type='button'
        >
          Switch to Legacy (63)
        </Button>
      </div>
      {newProvincesLoading && (
        <div className='text-sm opacity-70'>Loading...</div>
      )}
      <div className='space-y-5'>
        <CascadeSelectField
          label={t('province')}
          placeholder={t('chooseProvince')}
          value={value.provinceId as string | undefined}
          options={newProvinces.map((p) => ({ id: p.code, label: p.name }))}
          onChange={handleProvince}
          searchable
        />
        <CascadeSelectField
          label='Phường/Xã'
          placeholder='Chọn phường/xã'
          value={value.wardId as string | undefined}
          disabled={!provinceCode || newWardsLoading}
          options={newWards.map((w) => ({ id: w.code, label: w.name }))}
          onChange={handleWard}
          searchable
        />
        <div className='text-sm text-muted-foreground'>
          Note: New structure (34 provinces) doesn&apos;t support districts,
          streets, and projects. Only Province → Ward.
        </div>
      </div>
    </div>
  )
}

export default AreaProjectViewDual
