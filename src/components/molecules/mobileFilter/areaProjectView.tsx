import React, { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ListFilters } from '@/contexts/list/index.type'
import {
  useLegacyProvinces,
  useLegacyDistricts,
  useLegacyWards,
  useLegacyStreets,
  useLegacyProjects,
} from '@/hooks/useAddress'
import CascadeSelectField from '@/components/atoms/cascadeSelectField'

interface AreaProjectViewProps {
  value: ListFilters
  onChange: (partial: Partial<ListFilters>) => void
}

const AreaProjectView: React.FC<AreaProjectViewProps> = ({
  value,
  onChange,
}) => {
  const t = useTranslations('residentialFilter.areaProject')

  // Parse string IDs to numbers for API calls
  const provinceId = value.provinceId ? Number(value.provinceId) : undefined
  const districtId = value.districtId ? Number(value.districtId) : undefined
  const wardId = value.wardId ? Number(value.wardId) : undefined

  // Fetch data using React Query hooks
  const { data: provincesData, isLoading: provincesLoading } =
    useLegacyProvinces()
  const { data: districtsData, isLoading: districtsLoading } =
    useLegacyDistricts(provinceId)
  const { data: wardsData, isLoading: wardsLoading } =
    useLegacyWards(districtId)
  const { data: streetsData, isLoading: streetsLoading } = useLegacyStreets(
    wardId,
    districtId,
    provinceId,
  )
  const { data: projectsData, isLoading: projectsLoading } = useLegacyProjects(
    provinceId,
    districtId,
  )

  const provinces = provincesData || []
  const districts = districtsData || []
  const wards = wardsData || []
  const streets = streetsData || []
  const projects = projectsData || []

  const isLoading = provincesLoading

  // Reset dependent fields when parent changes
  useEffect(() => {
    if (!provinceId) {
      onChange({
        districtId: undefined,
        wardId: undefined,
        streetId: undefined,
        projectId: undefined,
      })
    }
  }, [provinceId])

  useEffect(() => {
    if (!districtId) {
      onChange({ wardId: undefined, streetId: undefined, projectId: undefined })
    }
  }, [districtId])

  useEffect(() => {
    if (!wardId) {
      onChange({ streetId: undefined })
    }
  }, [wardId])

  const handleProvince = (id: string) => {
    onChange({ provinceId: id ? Number(id) : undefined })
  }

  const handleDistrict = (id: string) => {
    onChange({ districtId: id ? Number(id) : undefined })
  }

  const handleWard = (id: string) => {
    onChange({ wardId: id ? Number(id) : undefined })
  }

  const handleStreet = (id: string) => {
    onChange({ streetId: id ? Number(id) : undefined })
  }

  const handleProject = (id: string) => {
    onChange({ projectId: id || undefined })
  }

  return (
    <div className='p-4'>
      <div className='mb-4'>
        <h2 className='text-base font-semibold'>{t('title')}</h2>
      </div>
      {isLoading && <div className='text-sm opacity-70'>Loading...</div>}
      <div className='space-y-5'>
        <CascadeSelectField
          label={t('province')}
          placeholder={t('chooseProvince')}
          value={value.provinceId as string | undefined}
          options={provinces.map((p) => ({
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
          disabled={!provinceId || districtsLoading}
          options={districts.map((d) => ({
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
          disabled={!districtId || wardsLoading}
          options={wards.map((w) => ({
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
          disabled={!districtId || streetsLoading}
          options={streets.map((s) => ({
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
          disabled={!districtId || projectsLoading}
          options={projects.map((pr) => ({
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

export default AreaProjectView
