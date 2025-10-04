// Shared interfaces for Vietnamese administrative divisions

export interface BaseAdministrativeDivision {
  code: string
  name: string
  normalized: string
}

export interface Province extends BaseAdministrativeDivision {}

export interface District extends BaseAdministrativeDivision {
  provinceCode: string
}

export interface Ward extends BaseAdministrativeDivision {
  districtCode: string
  provinceCode: string
  type: 'phường' | 'xã' | 'thị trấn'
}

// Shared utility functions
export const normalizeVietnameseText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export const createSearchableDivision = <T extends BaseAdministrativeDivision>(
  division: Omit<T, 'normalized'>,
): T => {
  return {
    ...division,
    normalized: normalizeVietnameseText(division.name),
  } as T
}
