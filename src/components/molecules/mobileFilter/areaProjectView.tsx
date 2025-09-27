import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ListFilters } from '@/contexts/list/index.type'
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
  fetchStreets,
  fetchProjects,
  LocationItem,
} from '@/api/services/location.service'
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
  const [loading, setLoading] = useState(true)
  const [provinces, setProvinces] = useState<LocationItem[]>([])
  const [districts, setDistricts] = useState<LocationItem[]>([])
  const [wards, setWards] = useState<LocationItem[]>([])
  const [streets, setStreets] = useState<LocationItem[]>([])
  const [projects, setProjects] = useState<LocationItem[]>([])

  const provinceId = value.provinceId
  const districtId = value.districtId

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const [p] = await Promise.all([fetchProvinces()])
      setProvinces(p)
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!provinceId) {
      setDistricts([])
      setWards([])
      setStreets([])
      setProjects([])
      onChange({
        districtId: undefined,
        wardId: undefined,
        streetId: undefined,
        projectId: undefined,
      })
      return
    }
    const load = async () => {
      const d = await fetchDistricts(provinceId)
      setDistricts(d)
    }
    load()
  }, [provinceId])

  useEffect(() => {
    if (!districtId) {
      setWards([])
      setStreets([])
      setProjects([])
      onChange({ wardId: undefined, streetId: undefined, projectId: undefined })
      return
    }
    const load = async () => {
      const [w, s, pr] = await Promise.all([
        fetchWards(districtId),
        fetchStreets(districtId),
        fetchProjects(districtId),
      ])
      setWards(w)
      setStreets(s)
      setProjects(pr)
    }
    load()
  }, [districtId])

  const handleProvince = (id: string) =>
    onChange({ provinceId: id || undefined })
  const handleDistrict = (id: string) =>
    onChange({ districtId: id || undefined })
  const handleWard = (id: string) => onChange({ wardId: id || undefined })
  const handleStreet = (id: string) => onChange({ streetId: id || undefined })
  const handleProject = (id: string) => onChange({ projectId: id || undefined })

  return (
    <div className='p-4'>
      <div className='mb-4'>
        <h2 className='text-base font-semibold'>{t('title')}</h2>
      </div>
      {loading && <div className='text-sm opacity-70'>Loading...</div>}
      <div className='space-y-5'>
        <CascadeSelectField
          label={t('province')}
          placeholder={t('chooseProvince')}
          value={provinceId}
          options={provinces.map((p) => ({ id: p.id, label: p.name }))}
          onChange={handleProvince}
          searchable
        />
        <CascadeSelectField
          label={t('district')}
          placeholder={t('chooseDistrict')}
          value={districtId}
          disabled={!provinceId}
          options={districts.map((d) => ({ id: d.id, label: d.name }))}
          onChange={handleDistrict}
          searchable
        />
        <CascadeSelectField
          label={t('ward')}
          placeholder={t('chooseWard')}
          value={value.wardId}
          disabled={!districtId}
          options={wards.map((w) => ({ id: w.id, label: w.name }))}
          onChange={handleWard}
          searchable
        />
        <CascadeSelectField
          label={t('street')}
          placeholder={t('chooseStreet')}
          value={value.streetId}
          disabled={!districtId}
          options={streets.map((s) => ({ id: s.id, label: s.name }))}
          onChange={handleStreet}
          searchable
        />
        <CascadeSelectField
          label={t('project')}
          placeholder={t('chooseProject')}
          value={value.projectId}
          disabled={!districtId}
          options={projects.map((pr) => ({ id: pr.id, label: pr.name }))}
          onChange={handleProject}
          searchable
        />
      </div>
    </div>
  )
}

export default AreaProjectView
