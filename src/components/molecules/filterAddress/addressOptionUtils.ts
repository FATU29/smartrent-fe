import { useMemo } from 'react'
import type { Option } from './usePagedList'
import type {
  District,
  NewProvince,
  NewWard,
  Project,
  ProvinceSimple,
  Street,
  StreetExtended,
  Ward,
} from '@/api/types/address.type'

// Helper type for items with flexible ID fields (without index signature requirement)
type ItemWithFlexibleId = {
  id?: number
  name?: string
  code?: string | number
  provinceId?: number
  districtId?: number
  wardId?: number
  streetId?: number
  projectId?: number
}

/**
 * Creates options from legacy address items with flexible ID extraction
 */
const createLegacyOptions = <T extends ItemWithFlexibleId>(
  items: readonly T[] | T[] | undefined,
  getId: (item: T) => number | string | undefined,
): Option[] => {
  if (!Array.isArray(items)) return []
  return items
    .filter((item) => {
      const id = getId(item)
      return (typeof id === 'string' || typeof id === 'number') && item?.name
    })
    .map((item) => {
      const id = getId(item)
      return {
        value: String(id!),
        label: item.name!,
      }
    })
}

/**
 * Creates options from new address structure items (code-based)
 */
const createNewStructureOptions = <T extends { code?: string; name?: string }>(
  items: readonly T[] | T[] | undefined,
): Option[] => {
  if (!Array.isArray(items)) return []
  return items
    .filter((item) => item?.code && item?.name)
    .map((item) => ({
      value: item.code!,
      label: item.name!,
    }))
}

/**
 * Creates options from legacy provinces
 */
export const useLegacyProvinceOptions = (
  provinces: readonly ProvinceSimple[] | ProvinceSimple[] | undefined,
): Option[] => {
  return useMemo(() => {
    return createLegacyOptions(
      provinces as readonly ItemWithFlexibleId[] | ItemWithFlexibleId[],
      (p) => {
        return p.provinceId
      },
    )
  }, [provinces])
}

/**
 * Creates options from legacy districts
 */
export const useLegacyDistrictOptions = (
  districts: readonly District[] | District[] | undefined,
): Option[] => {
  return useMemo(() => {
    return createLegacyOptions(
      districts as readonly ItemWithFlexibleId[] | ItemWithFlexibleId[],
      (d) => {
        return d.districtId
      },
    )
  }, [districts])
}

/**
 * Creates options from legacy wards
 */
export const useLegacyWardOptions = (
  wards: readonly Ward[] | Ward[] | undefined,
): Option[] => {
  return useMemo(() => {
    return createLegacyOptions(
      wards as readonly ItemWithFlexibleId[] | ItemWithFlexibleId[],
      (w) => {
        return w.wardId ?? w.id
      },
    )
  }, [wards])
}

/**
 * Creates options from legacy streets
 */
export const useLegacyStreetOptions = (
  streets: readonly Street[] | Street[] | undefined,
): Option[] => {
  return useMemo(() => {
    return createLegacyOptions(
      streets as readonly ItemWithFlexibleId[] | ItemWithFlexibleId[],
      (s) => {
        return s.streetId
      },
    )
  }, [streets])
}

/**
 * Creates options from legacy projects
 */
export const useLegacyProjectOptions = (
  projects:
    | readonly (Project & { projectId?: number })[]
    | (Project & { projectId?: number })[]
    | undefined,
): Option[] => {
  return useMemo(() => {
    if (!Array.isArray(projects)) return []
    return projects
      .filter((p) => (p?.id ?? p?.projectId) && p?.name)
      .map((p) => ({
        value: String(p.id ?? p.projectId),
        label: p.name,
      }))
  }, [projects])
}

/**
 * Creates options from new structure provinces
 */
export const useNewProvinceOptions = (
  provinces: readonly NewProvince[] | NewProvince[] | undefined,
): Option[] => {
  return useMemo(() => {
    return createNewStructureOptions(provinces)
  }, [provinces])
}

/**
 * Creates options from new structure wards
 */
export const useNewWardOptions = (
  wards: readonly NewWard[] | NewWard[] | undefined,
): Option[] => {
  return useMemo(() => {
    return createNewStructureOptions(wards)
  }, [wards])
}

/**
 * Creates options from street items (handles both Street and StreetExtended)
 */
export const useStreetExtendedOptions = (
  streets:
    | readonly Street[]
    | readonly StreetExtended[]
    | Street[]
    | StreetExtended[]
    | undefined,
): Option[] => {
  return useMemo(() => {
    if (!Array.isArray(streets)) return []
    return streets
      .filter((s) => {
        const street = s as Street
        return street?.streetId && street?.name
      })
      .map((s) => {
        const street = s as Street
        return { value: String(street.streetId), label: street.name }
      })
  }, [streets])
}

/**
 * Creates options from project items
 */
export const useProjectOptions = (
  projects: readonly Project[] | undefined,
): Option[] => {
  return useMemo(() => {
    if (!Array.isArray(projects)) return []
    return projects
      .filter((p) => p?.id && p?.name)
      .map((p) => ({ value: String(p.id), label: p.name }))
  }, [projects])
}

/**
 * Creates options from search street results
 */
export const useSearchStreetOptions = (
  streets: readonly StreetExtended[] | undefined,
): Option[] => {
  return useMemo(() => {
    if (!Array.isArray(streets)) return []
    const streetIdOf = (
      s: Partial<StreetExtended> & { id?: number },
    ): number | undefined => s.streetId ?? s.id
    return streets
      .filter(
        (s: Partial<StreetExtended> & { id?: number; name?: string }) =>
          Boolean(streetIdOf(s)) && Boolean(s?.name),
      )
      .map((s: Partial<StreetExtended> & { id?: number; name?: string }) => ({
        value: String(streetIdOf(s)!),
        label: String(s?.name ?? ''),
      }))
  }, [streets])
}
