// Mock location & project cascading service.
// Replace with real API calls later.

export interface LocationItem {
  id: string
  name: string
  parentId?: string
  type: 'province' | 'district' | 'ward' | 'street' | 'project'
}

const provinces: LocationItem[] = [
  { id: 'p_hcm', name: 'Hồ Chí Minh', type: 'province' },
  { id: 'p_hn', name: 'Hà Nội', type: 'province' },
]

const districts: LocationItem[] = [
  { id: 'd_q1', name: 'Quận 1', parentId: 'p_hcm', type: 'district' },
  { id: 'd_q7', name: 'Quận 7', parentId: 'p_hcm', type: 'district' },
  { id: 'd_cg', name: 'Cầu Giấy', parentId: 'p_hn', type: 'district' },
]

const wards: LocationItem[] = [
  { id: 'w_bnghe', name: 'Bến Nghé', parentId: 'd_q1', type: 'ward' },
  { id: 'w_tanphong', name: 'Tân Phong', parentId: 'd_q7', type: 'ward' },
]

const streets: LocationItem[] = [
  { id: 's_nguyenhue', name: 'Nguyễn Huệ', parentId: 'd_q1', type: 'street' },
  {
    id: 's_nguyentatthanh',
    name: 'Nguyễn Tất Thành',
    parentId: 'd_q7',
    type: 'street',
  },
]

const projects: LocationItem[] = [
  {
    id: 'pr_vinhomes',
    name: 'Vinhomes Central Park',
    parentId: 'd_q1',
    type: 'project',
  },
  {
    id: 'pr_phumyhung',
    name: 'Phú Mỹ Hưng',
    parentId: 'd_q7',
    type: 'project',
  },
]

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const fetchProvinces = async (): Promise<LocationItem[]> => {
  await delay(100)
  return provinces
}
export const fetchDistricts = async (provinceId?: string) => {
  await delay(100)
  return districts.filter((d) => !provinceId || d.parentId === provinceId)
}
export const fetchWards = async (districtId?: string) => {
  await delay(100)
  return wards.filter((w) => !districtId || w.parentId === districtId)
}
export const fetchStreets = async (districtId?: string) => {
  await delay(100)
  return streets.filter((s) => !districtId || s.parentId === districtId)
}
export const fetchProjects = async (districtId?: string) => {
  await delay(100)
  return projects.filter((p) => !districtId || p.parentId === districtId)
}
