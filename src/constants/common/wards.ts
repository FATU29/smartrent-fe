// Vietnamese wards/communes data (sample structure)
// Phường/Xã data linked to districts

import { Ward, normalizeVietnameseText } from './shared'

export type { Ward }

// Alias for backward compatibility
const stripDiacritics = normalizeVietnameseText

// Sample wards for some districts (Ba Dinh district of Hanoi and District 1 of Ho Chi Minh City)
export const VIETNAM_WARDS: Ward[] = [
  // Ba Dinh District (001) - Hanoi
  {
    code: '00101',
    name: 'Phường Phúc Xá',
    districtCode: '001',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Phúc Xá'),
  },
  {
    code: '00102',
    name: 'Phường Trúc Bạch',
    districtCode: '001',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Trúc Bạch'),
  },
  {
    code: '00103',
    name: 'Phường Vĩnh Phúc',
    districtCode: '001',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Vĩnh Phúc'),
  },
  {
    code: '00104',
    name: 'Phường Cống Vị',
    districtCode: '001',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Cống Vị'),
  },
  {
    code: '00105',
    name: 'Phường Liễu Giai',
    districtCode: '001',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Liễu Giai'),
  },
  {
    code: '00106',
    name: 'Phường Nguyễn Trung Trực',
    districtCode: '001',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Nguyễn Trung Trực'),
  },
  {
    code: '00107',
    name: 'Phường Quán Thánh',
    districtCode: '001',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Quán Thánh'),
  },
  {
    code: '00108',
    name: 'Phường Ngọc Hà',
    districtCode: '001',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Ngọc Hà'),
  },
  {
    code: '00109',
    name: 'Phường Điện Biên',
    districtCode: '001',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Điện Biên'),
  },
  {
    code: '00110',
    name: 'Phường Đội Cần',
    districtCode: '001',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Đội Cần'),
  },
  {
    code: '00111',
    name: 'Phường Ngọc Khánh',
    districtCode: '001',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Ngọc Khánh'),
  },
  {
    code: '00112',
    name: 'Phường Kim Mã',
    districtCode: '001',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Kim Mã'),
  },
  {
    code: '00113',
    name: 'Phường Giảng Võ',
    districtCode: '001',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Giảng Võ'),
  },
  {
    code: '00114',
    name: 'Phường Thành Công',
    districtCode: '001',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Thành Công'),
  },

  // Hoan Kiem District (002) - Hanoi
  {
    code: '00201',
    name: 'Phường Phúc Tân',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Phúc Tân'),
  },
  {
    code: '00202',
    name: 'Phường Đồng Xuân',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Đồng Xuân'),
  },
  {
    code: '00203',
    name: 'Phường Hàng Mã',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Hàng Mã'),
  },
  {
    code: '00204',
    name: 'Phường Hàng Buồm',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Hàng Buồm'),
  },
  {
    code: '00205',
    name: 'Phường Hàng Đào',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Hàng Đào'),
  },
  {
    code: '00206',
    name: 'Phường Hàng Bồ',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Hàng Bồ'),
  },
  {
    code: '00207',
    name: 'Phường Cửa Đông',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Cửa Đông'),
  },
  {
    code: '00208',
    name: 'Phường Lý Thái Tổ',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Lý Thái Tổ'),
  },
  {
    code: '00209',
    name: 'Phường Hàng Bạc',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Hàng Bạc'),
  },
  {
    code: '00210',
    name: 'Phường Hàng Gai',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Hàng Gai'),
  },
  {
    code: '00211',
    name: 'Phường Chương Dương Độ',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Chương Dương Độ'),
  },
  {
    code: '00212',
    name: 'Phường Hàng Trống',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Hàng Trống'),
  },
  {
    code: '00213',
    name: 'Phường Cửa Nam',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Cửa Nam'),
  },
  {
    code: '00214',
    name: 'Phường Hàng Bông',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Hàng Bông'),
  },
  {
    code: '00215',
    name: 'Phường Tràng Tiền',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Tràng Tiền'),
  },
  {
    code: '00216',
    name: 'Phường Trần Hưng Đạo',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Trần Hưng Đạo'),
  },
  {
    code: '00217',
    name: 'Phường Phan Chu Trinh',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Phan Chu Trinh'),
  },
  {
    code: '00218',
    name: 'Phường Hang Bài',
    districtCode: '002',
    provinceCode: '01',
    type: 'phường',
    normalized: stripDiacritics('Phường Hang Bài'),
  },

  // District 1 (101) - Ho Chi Minh City
  {
    code: '10101',
    name: 'Phường Tân Định',
    districtCode: '101',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường Tân Định'),
  },
  {
    code: '10102',
    name: 'Phường Đa Kao',
    districtCode: '101',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường Đa Kao'),
  },
  {
    code: '10103',
    name: 'Phường Bến Nghé',
    districtCode: '101',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường Bến Nghé'),
  },
  {
    code: '10104',
    name: 'Phường Bến Thành',
    districtCode: '101',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường Bến Thành'),
  },
  {
    code: '10105',
    name: 'Phường Nguyễn Thái Bình',
    districtCode: '101',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường Nguyễn Thái Bình'),
  },
  {
    code: '10106',
    name: 'Phường Phạm Ngũ Lão',
    districtCode: '101',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường Phạm Ngũ Lão'),
  },
  {
    code: '10107',
    name: 'Phường Cầu Ông Lãnh',
    districtCode: '101',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường Cầu Ông Lãnh'),
  },
  {
    code: '10108',
    name: 'Phường Cô Giang',
    districtCode: '101',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường Cô Giang'),
  },
  {
    code: '10109',
    name: 'Phường Nguyễn Cư Trinh',
    districtCode: '101',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường Nguyễn Cư Trinh'),
  },
  {
    code: '10110',
    name: 'Phường Cầu Kho',
    districtCode: '101',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường Cầu Kho'),
  },

  // District 3 (103) - Ho Chi Minh City
  {
    code: '10301',
    name: 'Phường 1',
    districtCode: '103',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường 1'),
  },
  {
    code: '10302',
    name: 'Phường 2',
    districtCode: '103',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường 2'),
  },
  {
    code: '10303',
    name: 'Phường 3',
    districtCode: '103',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường 3'),
  },
  {
    code: '10304',
    name: 'Phường 4',
    districtCode: '103',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường 4'),
  },
  {
    code: '10305',
    name: 'Phường 5',
    districtCode: '103',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường 5'),
  },
  {
    code: '10306',
    name: 'Phường 6',
    districtCode: '103',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường 6'),
  },
  {
    code: '10307',
    name: 'Phường 7',
    districtCode: '103',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường 7'),
  },
  {
    code: '10308',
    name: 'Phường 8',
    districtCode: '103',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường 8'),
  },
  {
    code: '10309',
    name: 'Phường 9',
    districtCode: '103',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường 9'),
  },
  {
    code: '10310',
    name: 'Phường 10',
    districtCode: '103',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường 10'),
  },
  {
    code: '10311',
    name: 'Phường 11',
    districtCode: '103',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường 11'),
  },
  {
    code: '10312',
    name: 'Phường 12',
    districtCode: '103',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường 12'),
  },
  {
    code: '10313',
    name: 'Phường 13',
    districtCode: '103',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường 13'),
  },
  {
    code: '10314',
    name: 'Phường 14',
    districtCode: '103',
    provinceCode: '79',
    type: 'phường',
    normalized: stripDiacritics('Phường 14'),
  },
]

// Create mapping objects for quick lookups
export const DISTRICT_WARD_MAP: Record<string, Ward[]> = VIETNAM_WARDS.reduce(
  (acc, ward) => {
    if (!acc[ward.districtCode]) {
      acc[ward.districtCode] = []
    }
    acc[ward.districtCode].push(ward)
    return acc
  },
  {} as Record<string, Ward[]>,
)

export const PROVINCE_WARD_MAP: Record<string, Ward[]> = VIETNAM_WARDS.reduce(
  (acc, ward) => {
    if (!acc[ward.provinceCode]) {
      acc[ward.provinceCode] = []
    }
    acc[ward.provinceCode].push(ward)
    return acc
  },
  {} as Record<string, Ward[]>,
)

// Utility functions
export const findWardByCode = (code?: string) =>
  VIETNAM_WARDS.find((w) => w.code === code)

export const getWardsByDistrictCode = (districtCode: string) =>
  DISTRICT_WARD_MAP[districtCode] || []

export const getWardsByProvinceCode = (provinceCode: string) =>
  PROVINCE_WARD_MAP[provinceCode] || []

export const searchWards = (
  keyword: string,
  districtCode?: string,
  provinceCode?: string,
) => {
  const k = stripDiacritics(keyword.trim())
  let wards = VIETNAM_WARDS

  if (districtCode) {
    wards = getWardsByDistrictCode(districtCode)
  } else if (provinceCode) {
    wards = getWardsByProvinceCode(provinceCode)
  }

  if (!k) return wards
  return wards.filter((w) => w.normalized.includes(k) || w.code === keyword)
}

export const getWardsCountByDistrict = (districtCode: string): number => {
  return DISTRICT_WARD_MAP[districtCode]?.length || 0
}

export const getWardsCountByProvince = (provinceCode: string): number => {
  return PROVINCE_WARD_MAP[provinceCode]?.length || 0
}

export type WardCode = (typeof VIETNAM_WARDS)[number]['code']
